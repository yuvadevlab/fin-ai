import { Controller, Get, Patch, Req, Body, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Prisma } from "@finai/database";
import { UserPreferences } from "@finai/shared-types";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { AuthenticatedRequest } from "../workspaces/workspaces.controller";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get("profile")
  @ApiOperation({ summary: "Get current user profile and preferences" })
  async getProfile(@Req() req: AuthenticatedRequest) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: req.user.id },
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

  @Patch("profile")
  @ApiOperation({ summary: "Update current user profile and preferences" })
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: { name?: string; email?: string; preferences?: UserPreferences },
  ) {
    const data: Prisma.UserUpdateInput = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;

    if (body.preferences !== undefined) {
      const user = await this.prisma.client.user.findUnique({
        where: { id: req.user.id },
        select: { preferences: true },
      });
      const currentPrefs = (user?.preferences as unknown as UserPreferences) || {};

      const mergedPrefs: UserPreferences = {
        notifications: {
          ...(currentPrefs.notifications || {}),
          ...(body.preferences.notifications || {}),
        },
        appearance: {
          ...(currentPrefs.appearance || {}),
          ...(body.preferences.appearance || {}),
        },
        security: {
          ...(currentPrefs.security || {}),
          ...(body.preferences.security || {}),
        },
      };

      data.preferences = mergedPrefs as unknown as Prisma.InputJsonValue;
    }

    const updated = await this.prisma.client.user.update({
      where: { id: req.user.id },
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
