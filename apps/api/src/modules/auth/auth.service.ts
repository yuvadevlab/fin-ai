import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { Logger } from "@yuva-devlab/logger";

/**
 * Authentication service for FinAI.
 * Identity lifecycle and credentials are delegated exclusively to DevLab Portal SSO.
 * This service manages local user resolution and shadow profile validations.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger("AuthService");

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Used by Passport's JWT strategy to re-fetch the full user record after
   * the token is decoded. Throws NotFoundException if the user does not exist.
   */
  async validateUserById(userId: string) {
    this.logger.info(`[validateUserById] Validating user ${userId.slice(0, 8)} from JWT`);
    const user = await this.prisma.client.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`[validateUserById] User not found for JWT subject: ${userId.slice(0, 8)}`);
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
