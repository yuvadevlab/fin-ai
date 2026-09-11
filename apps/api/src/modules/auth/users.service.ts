import { Injectable } from "@nestjs/common";
import { Prisma } from "@finai/database";
import { UserPreferences } from "@finai/shared-types";
import { type UpdateProfileInput } from "@finai/validation";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
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
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
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
    return updated;
  }
}
