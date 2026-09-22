import "reflect-metadata";
import "dotenv/config";
import {
  Logger,
  requestLogger,
  type LogLevel,
  type LoggerConfig,
  loggerWithConfig,
} from "@yuva-devlab/logger";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { IncomingMessage, ServerResponse } from "http";

/** Minimum log level to emit — parsed from LOG_LEVEL, defaults to "info". */
function parseLogLevel(raw?: string): LogLevel {
  if (!raw) return "info";
  const v = raw.trim().toLowerCase();
  return ["debug", "info", "warn", "error"].includes(v) ? (v as LogLevel) : "info";
}

/** Random short id used as the per-request correlation id. */
function makeRequestId(): string {
  const rand = Math.random().toString(36).slice(2);
  return `req_${Date.now().toString(36)}_${rand.slice(0, 8)}`;
}

async function bootstrap() {
  const logConfig: LoggerConfig = {
    enabled: process.env.LOG_ENABLED !== "false",
    level: parseLogLevel(process.env.LOG_LEVEL),
    file: process.env.LOG_FILE ?? undefined,
  };
  // Env-aware loggers: both the Nest app logger and the HTTP request logger
  // honor LOG_ENABLED / LOG_LEVEL / LOG_PERSIST / LOG_FILE, while keeping a
  // stable context string for the '[API]' / '[HTTP]' tags.
  const appLogger = loggerWithConfig(new Logger("API"), logConfig);
  const httpLogger = loggerWithConfig(new Logger("HTTP"), logConfig);

  const app = await NestFactory.create(AppModule, { logger: appLogger });

  // Global prefix
  app.setGlobalPrefix("api/v1");

  // Request logger — mounted only when LOG_REQUESTS is not explicitly "false".
  // Attaches a per-request correlation id so every log block (controller,
  // service, request-logger, exception filter) can include it when debugging.
  if (process.env.LOG_REQUESTS !== "false") {
    app.use((req: IncomingMessage, _res: ServerResponse, next: () => void) => {
      req.headers["x-request-id"] = (req.headers["x-request-id"] as string) ?? makeRequestId();
      next();
    });
    app.use(requestLogger(httpLogger as unknown as Logger));
  }

  // CORS
  app.enableCors({
    origin: process.env.WEB_URL?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle("FinAI API")
    .setDescription("AI-powered Personal Finance Platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  appLogger.info(`🚀 FinAI API running on http://localhost:${port}`);
  appLogger.info(`📖 Swagger docs: http://localhost:${port}/api/docs`);
  appLogger.debug(
    `Logger config: enabled=${logConfig.enabled}, level=${logConfig.level}, requests=${process.env.LOG_REQUESTS !== "false"}, persist=${process.env.LOG_PERSIST === "true"}, file=${logConfig.file ?? "(none)"}`,
  );
}

bootstrap();
