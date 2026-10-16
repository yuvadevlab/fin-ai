import "reflect-metadata";
import { config } from "./config";
import { Logger, requestLogger, type LoggerConfig, loggerWithConfig } from "@yuva-devlab/logger";
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

  // Global prefix
  app.setGlobalPrefix("api/v1");

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
