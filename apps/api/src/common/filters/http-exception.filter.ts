import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { Request, Response } from "express";

/**
 * Global exception filter that standardises all error responses into the
 * `{ success: false, statusCode, timestamp, path, error }` envelope.
 *
 * Catches both NestJS `HttpException` (e.g. `NotFoundException`,
 * `BadRequestException`) and raw `Error` instances (e.g. unhandled Prisma
 * rejections), mapping both to a consistent JSON shape. 500-level errors
 * are logged with their stack trace for debugging.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.getResponse() : "Internal server error";

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} ${status} — ${typeof message === "string" ? message : JSON.stringify(message).slice(0, 200)}`,
      );
    }

    response.status(status).json(errorResponse);
  }
}
