import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * JWT-based authentication guard.
 *
 * Extends NestJS `AuthGuard("jwt")` to use the `jwt` Passport strategy
 * defined in `auth/jwt.strategy.ts`. Applied globally via the API module
 * so every protected route requires a valid bearer token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
