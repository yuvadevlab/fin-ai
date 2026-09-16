import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Logger } from "@finai/logger";

/**
 * JWT-based authentication guard.
 *
 * Extends NestJS `AuthGuard("jwt")` to use the `jwt` Passport strategy
 * defined in `auth/jwt.strategy.ts`. Applied globally via the API module
 * so every protected route requires a valid bearer token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(JwtAuthGuard.name);

  handleRequest<TUser = never>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const req = context.switchToHttp().getRequest<{ method?: string; url?: string }>();
      const detail =
        info instanceof Error
          ? info.message
          : typeof info === "string"
            ? info
            : "missing/invalid token";
      this.logger.warn(
        `[JwtAuthGuard] Unauthorized ${req?.method ?? "?"} ${req?.url ?? "?"}: ${detail}`,
      );
      throw err instanceof Error ? err : new UnauthorizedException(detail);
    }
    return user as TUser;
  }
}
