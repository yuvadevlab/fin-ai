import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "@/modules/prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { Logger } from "@finai/logger";
import { LoginInput, RegisterInput } from "@finai/validation";
import { DEFAULT_CATEGORIES } from "@/modules/categories/default-categories";

/**
 * Authentication service: handles login, registration, and password reset.
 *
 * - `login`: verifies credentials with bcrypt and issues a signed JWT.
 * - `register`: creates the user, hashes the password, and seeds default
 *   spending categories (so the user has Groceries, Salary, etc. from day one).
 * - `forgotPassword` / `resetPassword`: token-based flow. The token is returned
 *   in the response during dev (no email provider); remove the `resetToken`
 *   field before production.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Authenticates a user by email + password and returns a JWT access token.
   * Uses bcrypt for constant-time password comparison against the stored hash.
   */
  async login(input: LoginInput) {
    this.logger.debug(`[login] Attempting login for email: ${input.email}`);
    const user = await this.prisma.client.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      this.logger.warn(`[login] Login failed — no user found for email: ${input.email}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      this.logger.warn(`[login] Login failed — invalid password for email: ${input.email}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    this.logger.info(
      `[login] User logged in successfully: ${input.email} (userId: ${user.id.slice(0, 8)})`,
    );
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  /**
   * Registers a new user. Throws `ConflictException` if the email already exists.
   * Also seeds `DEFAULT_CATEGORIES` so the user can start recording transactions
   * immediately without manually configuring categories first.
   */
  async register(input: RegisterInput) {
    this.logger.info(`[register] Registering new user: ${input.email}`);
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      this.logger.warn(`[register] Registration failed — email already exists: ${input.email}`);
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    this.logger.debug(`[register] Password hashed for user: ${input.email}`);

    const user = await this.prisma.client.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    });
    this.logger.info(`[register] User created: ${input.email} (userId: ${user.id.slice(0, 8)})`);

    // Seed default categories for the new user
    await this.prisma.client.category.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        userId: user.id,
        name: cat.name,
        group: cat.group,
        icon: cat.icon,
        isDefault: true,
      })),
    });
    this.logger.info(
      `[register] Seeded ${DEFAULT_CATEGORIES.length} default categories for user ${user.id.slice(0, 8)}`,
    );

    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Validates the email and generates a password-reset token.
   * Always returns the same "if an account exists…" message to prevent
   * email-enumeration attacks. The token is included in the response only
   * for development convenience (no email provider configured).
   */
  async forgotPassword(email: string) {
    this.logger.info(`[forgotPassword] Reset requested for email: ${email}`);
    const user = await this.prisma.client.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      this.logger.debug(`[forgotPassword] No user found for email: ${email} (silently ignored)`);
      return { message: "If an account exists with that email, a reset link has been sent." };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // In production, send this via email. For now, return the token in the response
    // so the dev/demo flow works without an email provider.
    const resetUrl = `${process.env.FRONTEND_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    this.logger.info(
      `[forgotPassword] Reset token generated for user ${user.id.slice(0, 8)}: ${resetUrl}`,
    );
    this.logger.debug(`[forgotPassword] Token expires at: ${expires.toISOString()}`);

    return {
      message: "If an account exists with that email, a reset link has been sent.",
      // Remove the next line in production (after setting up email delivery)
      resetToken: token,
    };
  }

  /**
   * Resets the user's password using a valid, non-expired token.
   * Clears the token and expiry so it cannot be reused.
   */
  async resetPassword(token: string, newPassword: string) {
    this.logger.info(`[resetPassword] Reset attempted with token: ${token.slice(0, 8)}...`);
    const user = await this.prisma.client.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      this.logger.warn(`[resetPassword] Invalid or expired token: ${token.slice(0, 8)}...`);
      throw new BadRequestException("Invalid or expired reset token. Please request a new one.");
    }

    this.logger.info(`[resetPassword] Resetting password for user ${user.id.slice(0, 8)}`);
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    this.logger.info(`[resetPassword] Password reset successfully for user ${user.id.slice(0, 8)}`);
    return { message: "Password has been reset successfully. You can now log in." };
  }

  /**
   * Used by Passport's JWT strategy to re-fetch the full user record after
   * the token is decoded. Throws `NotFoundException` if the user no longer exists
   * (e.g. deleted account).
   */
  async validateUserById(userId: string) {
    this.logger.debug(`[validateUserById] Validating user ${userId.slice(0, 8)} from JWT`);
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`[validateUserById] User not found for JWT subject: ${userId.slice(0, 8)}`);
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
