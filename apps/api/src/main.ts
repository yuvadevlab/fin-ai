import "reflect-metadata";
import "dotenv/config";
import { Logger, requestLogger } from "@finai/logger";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const logger = new Logger("API");
  const app = await NestFactory.create(AppModule, { logger });

  // Global prefix
  app.setGlobalPrefix("api/v1");
  app.use(requestLogger(new Logger("HTTP")));

  // CORS
  app.enableCors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle("FinAI API")
    .setDescription("AI-powered Personal & Family Finance Platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.info(`🚀 FinAI API running on http://localhost:${port}`);
  logger.info(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
