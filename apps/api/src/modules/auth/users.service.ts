import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { Prisma } from "@finai/database";
import { UserPreferences } from "@finai/shared-types";
import { type UpdateProfileInput } from "@finai/validation";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    this.logger.debug(`[getProfile] Fetching profile for user ${userId.slice(0, 8)}`);
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        preferences: true,
      },
    });
    if (!user) {
      this.logger.warn(`[getProfile] No profile found for user ${userId.slice(0, 8)}`);
    }
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const changed: string[] = [];
    if (input.name !== undefined) changed.push("name");
    if (input.email !== undefined) changed.push("email");
    if (input.preferences !== undefined) changed.push("preferences");
    this.logger.debug(
      `[updateProfile] Updating profile for user ${userId.slice(0, 8)}: [${changed.join(", ")}]`,
    );
    const data: Prisma.UserUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;

    if (input.preferences !== undefined) {
      const user = await this.prisma.client.user.findUnique({
        where: { id: userId },
        select: { preferences: true },
      });
      const currentPrefs = (user?.preferences as unknown as UserPreferences) || {};

      const mergedPrefs: UserPreferences = {
        notifications: {
          ...(currentPrefs.notifications || {}),
          ...(input.preferences.notifications || {}),
        },
        appearance: {
          ...(currentPrefs.appearance || {}),
          ...(input.preferences.appearance || {}),
        },
        security: {
          ...(currentPrefs.security || {}),
          ...(input.preferences.security || {}),
        },
      };

      data.preferences = mergedPrefs as unknown as Prisma.InputJsonValue;
    }

    const updated = await this.prisma.client.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        preferences: true,
      },
    });
    this.logger.info(
      `[updateProfile] Profile updated for user ${userId.slice(0, 8)}: [${changed.join(", ")}]`,
    );
    return updated;
  }
}
