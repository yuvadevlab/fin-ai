import "reflect-metadata";
import { config } from "./config";
import { Logger, requestLogger, type LoggerConfig, loggerWithConfig } from "@yuva-devlab/logger";
import { createAppKillSwitchMiddleware, AppStatus } from "@yuva-devlab/auth-server";
import { DEVLAB_CONFIG } from "@finai/shared-types";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { IncomingMessage, ServerResponse } from "http";

/** Random short id used as the per-request correlation id. */
function makeRequestId(): string {
  const rand = Math.random().toString(36).slice(2);
  return `req_${Date.now().toString(36)}_${rand.slice(0, 8)}`;
}

async function bootstrap() {
  const logConfig: LoggerConfig = {
    enabled: config.logEnabled,
    level: config.logLevel,
    file: config.logFile,
  };

  // Env-aware loggers: both the Nest app logger and the HTTP request logger
  // honor config.logEnabled / config.logLevel / config.logPersist / config.logFile,
  // while keeping a stable context string for the '[API]' / '[HTTP]' tags.
  const appLogger = loggerWithConfig(new Logger("API"), logConfig);
  const httpLogger = loggerWithConfig(new Logger("HTTP"), logConfig);

  const app = await NestFactory.create(AppModule, { logger: appLogger });

  // Global prefix with root health probe exclusion
  app.setGlobalPrefix("api/v1", {
    exclude: ["health", "api/v1/health"],
  });

  // Emergency platform kill-switch interceptor (whitelisting health probes and swagger documentation)
  let lastStatus = AppStatus.ACTIVE;
  let lastCheckTime = 0;
  const STATUS_CACHE_TTL_MS = 3000;

  const killSwitch = createAppKillSwitchMiddleware(async () => {
    const now = Date.now();
    if (now - lastCheckTime < STATUS_CACHE_TTL_MS) {
      return lastStatus;
    }
    try {
      const portalBase = (config.portalApiUrl || DEVLAB_CONFIG.DEFAULT_PORTAL_API_URL).replace(
        /\/+$/,
        "",
      );
      const res = await fetch(
        `${portalBase}/api/v1/platform/apps/${encodeURIComponent(DEVLAB_CONFIG.APP_ID)}/status`,
        {
          signal: AbortSignal.timeout(1500),
          headers: { Accept: "application/json" },
        },
      );
      if (res.ok) {
        const data = (await res.json()) as { status?: string; isActive?: boolean };
        lastStatus =
          data.status === "INACTIVE" || data.isActive === false
            ? AppStatus.INACTIVE
            : data.status === "MAINTENANCE"
              ? AppStatus.MAINTENANCE
              : AppStatus.ACTIVE;
        lastCheckTime = now;
      }
    } catch {
      // In offline / standalone development scenarios, fail open
    }
    return lastStatus;
  });

  app.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const rawUrl = req.url || "/";
    if (
      rawUrl.includes("/health") ||
      rawUrl.includes("/api/docs") ||
      rawUrl.startsWith("/favicon.ico")
    ) {
      return next();
    }
    const allowed = await killSwitch(req, res);
    if (allowed) {
      next();
    }
  });

  // Request logger — mounted only when config.logRequests is true.
  // Attaches a per-request correlation id so every log block can include it when debugging.
  if (config.logRequests) {
    app.use((req: IncomingMessage, _res: ServerResponse, next: () => void) => {
      req.headers["x-request-id"] = (req.headers["x-request-id"] as string) ?? makeRequestId();
      next();
    });
    app.use(requestLogger(httpLogger as unknown as Logger));
  }

  // CORS configuration using canonical allowed origins parsed from WEB_URL
  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger / OpenAPI documentation setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle("FinAI API")
    .setDescription("AI-powered Personal Finance Platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(config.port);
  appLogger.info(`🚀 FinAI API running on http://localhost:${config.port}`);
  appLogger.info(`📖 Swagger docs: http://localhost:${config.port}/api/docs`);
  appLogger.info(
    `Logger config: enabled=${config.logEnabled}, level=${config.logLevel}, requests=${config.logRequests}, persist=${config.logPersist}, file=${config.logFile ?? "(none)"}`,
  );
}

bootstrap();
