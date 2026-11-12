/**
 * @file apps/api/src/modules/auth/jwt.strategy.ts
 * @description NestJS Passport JWT authentication strategy supporting dual verification:
 * 1. RS256 SSO tokens issued by DevLab Gateway with JWKS verification.
 * 2. HS256 tokens issued locally by FinAI API with symmetric secret verification.
 * Supports Just-In-Time (JIT) provisioning for SSO users with default category seeding.
 * @module @finai/api/auth
 */

import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { config } from "@/config";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { DEFAULT_CATEGORIES } from "@/modules/categories/default-categories";
import { getDevLabPublicKey } from "./jwks.util";

/**
 * JWT payload embedded in access tokens from FinAI local auth or DevLab SSO.
 */
export interface JwtPayload {
  /** Subject identifier (User primary key) */
  sub: string;
  /** User verified email address */
  email: string;
  /** Optional display name passed by SSO portal */
  name?: string;
  /** Optional avatar URL passed by SSO portal */
  avatarUrl?: string;
  /** Optional user role */
  role?: string;
}

/**
 * NestJS Passport JWT strategy.
 *
 * Extracts the bearer token from the `Authorization` header. Dynamically checks
 * token header algorithm:
 * - If RS256: verifies against DevLab Portal JWKS public key.
 * - If HS256: verifies against FinAI local `config.jwtSecret`.
 *
 * On successful signature verification, `validate()` retrieves the user from
 * the local database, automatically JIT-provisioning SSO accounts if missing.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      algorithms: ["HS256", "RS256"],
      secretOrKeyProvider: (
        _req: unknown,
        rawJwtToken: string,
        done: (err: unknown, secretOrKey?: string | Buffer) => void,
      ) => {
        try {
          // Guard against null/empty tokens before header inspection
          if (!rawJwtToken || typeof rawJwtToken !== "string") {
            return done(new UnauthorizedException("Token missing or invalid"));
          }

          const parts = rawJwtToken.split(".");
          // Standard JWT must contain header, payload, and signature segments
          if (parts.length < 2 || !parts[0]) {
            return done(new UnauthorizedException("Malformed JWT structure"));
          }

          const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf-8")) as {
            alg?: string;
            kid?: string;
          };

          // If token was signed with RS256 (DevLab SSO), fetch JWKS public key
          if (header.alg === "RS256") {
            const portalApiUrl = process.env.DEVLAB_PORTAL_API_URL || "http://localhost:3015";
            getDevLabPublicKey(portalApiUrl, header.kid)
              .then((pem) => done(null, pem))
              .catch((err) => {
                this.logger.error("[secretOrKeyProvider] JWKS resolution failed", err);
                done(err);
              });
            return;
          }

          // Otherwise, fall back to FinAI symmetric secret for local HS256 tokens
          return done(null, config.jwtSecret);
        } catch (parseError) {
          this.logger.error("[secretOrKeyProvider] Error parsing token header", parseError);
          return done(parseError);
        }
      },
    });
  }

  /**
   * Validates the decoded JWT payload.
   * Looks up the user by ID or email. If the user does not exist (first-time SSO login),
   * provisions the user Just-In-Time (JIT) and seeds default spending categories.
   *
   * @param payload - Decoded JWT claims
   * @returns Authorized user object attached to `request.user`
   */
  async validate(payload: JwtPayload) {
    this.logger.info(
      `[validate] Validating JWT for sub=${payload.sub?.slice(0, 8)} email=${payload.email}`,
    );

    // 1. Look up user by primary key (id)
    let user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    // 2. If not found by ID, look up by normalized email
    if (!user && payload.email) {
      const normalizedEmail = payload.email.toLowerCase().trim();
      user = await this.prisma.client.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, email: true, name: true, avatarUrl: true },
      });
    }

    // 3. If user still does not exist, provision JIT from DevLab SSO token
    if (!user && payload.email) {
      const normalizedEmail = payload.email.toLowerCase().trim();
      const userName = payload.name?.trim() || normalizedEmail.split("@")[0] || "FinAI User";

      this.logger.info(
        `[validate] JIT provisioning new SSO user: ${normalizedEmail} (id: ${payload.sub})`,
      );

      user = await this.prisma.client.user.create({
        data: {
          id: payload.sub,
          email: normalizedEmail,
          name: userName,
          passwordHash: null,
          avatarUrl: payload.avatarUrl,
        },
        select: { id: true, email: true, name: true, avatarUrl: true },
      });

      // Seed default categories so the new user has a functional dashboard immediately
      try {
        await this.prisma.client.category.createMany({
          data: DEFAULT_CATEGORIES.map((cat) => ({
            userId: user.id,
            name: cat.name,
            group: cat.group,
            icon: cat.icon,
            isDefault: true,
          })),
          skipDuplicates: true,
        });
        this.logger.info(
          `[validate] Seeded ${DEFAULT_CATEGORIES.length} default categories for JIT user: ${user.id}`,
        );
      } catch (seedError) {
        this.logger.warn(`[validate] Category seeding warning for JIT user ${user.id}:`, seedError);
      }
    }

    // 4. If account could not be found or provisioned, reject authorization
    if (!user) {
      this.logger.warn(
        `[validate] Rejected token — no user for sub=${payload.sub?.slice(0, 8)} email=${payload.email}`,
      );
      throw new UnauthorizedException("User for this token no longer exists");
    }

    this.logger.info(`[validate] Authenticated user ${user.id.slice(0, 8)} (${user.email})`);
    return user;
  }
}
