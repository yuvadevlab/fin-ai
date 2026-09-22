import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@/modules/prisma/prisma.service";

/**
 * JWT payload embedded in the access token. `sub` is the user ID (PK), and
 * `email` is the user's email address. Both are validated on every request
 * by `JwtStrategy.validate`, which reloads the user from the DB to ensure
 * the account still exists.
 */
export interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * NestJS Passport JWT strategy.
 *
 * Extracts the bearer token from the `Authorization` header and validates it
 * against `JWT_SECRET`. On success, `validate()` looks the user up in the DB
 * and returns the user object (or throws, which produces a 401). The returned
 * object is attached to `request.user` and accessed via `@CurrentUser()`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("JWT_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    this.logger.debug(
      `[validate] Validating JWT for sub=${payload.sub.slice(0, 8)} email=${payload.email}`,
    );
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    if (!user) {
      this.logger.warn(
        `[validate] Rejected token — no user for sub=${payload.sub.slice(0, 8)} email=${payload.email}`,
      );
      // Thrown as 401 by the guard — the account was deleted or the sub is forged.
      throw new UnauthorizedException("User for this token no longer exists");
    }
    this.logger.debug(`[validate] Authenticated user ${user.id.slice(0, 8)} (${user.email})`);
    return user;
  }
}
