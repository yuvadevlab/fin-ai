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

@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(input: LoginInput) {
    const user = await this.prisma.client.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

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

  async register(input: RegisterInput) {
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.client.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    });

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

  async forgotPassword(email: string) {
    const user = await this.prisma.client.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration attacks
    if (!user) {
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

    this.logger.info(`Password reset link for ${email}: ${resetUrl}`);

    return {
      message: "If an account exists with that email, a reset link has been sent.",
      // Remove the next line in production (after setting up email delivery)
      resetToken: token,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.client.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException("Invalid or expired reset token. Please request a new one.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: "Password has been reset successfully. You can now log in." };
  }

  async validateUserById(userId: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
