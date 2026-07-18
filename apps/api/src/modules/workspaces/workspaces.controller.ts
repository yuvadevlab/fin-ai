import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Req,
  Param,
  Body,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
}

@ApiTags("Workspaces")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces")
export class WorkspacesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Get all workspaces for the logged in user" })
  async getWorkspaces(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.prisma.client.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  @Post()
  @ApiOperation({ summary: "Create a new workspace" })
  async createWorkspace(
    @Body() body: { name: string; type: "PERSONAL" | "FAMILY" },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;
    return this.prisma.client.workspace.create({
      data: {
        name: body.name,
        type: body.type,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  @Get(":id/members")
  @ApiOperation({ summary: "Get members of a workspace" })
  async getMembers(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const isMember = await this.prisma.client.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId } },
    });
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    return this.prisma.client.workspaceMember.findMany({
      where: { workspaceId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  @Post(":id/invites")
  @ApiOperation({ summary: "Invite a user to a workspace by email" })
  async inviteMember(
    @Param("id") id: string,
    @Body() body: { email: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;

    // Verify workspace exists and user is a member
    const isMember = await this.prisma.client.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId } },
    });
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    // Look up user by email
    const targetUser = await this.prisma.client.user.findUnique({
      where: { email: body.email },
    });
    if (!targetUser) {
      throw new NotFoundException(
        `User with email "${body.email}" not found. They must register first.`,
      );
    }

    // Check if already a member
    const existingMember = await this.prisma.client.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId: targetUser.id } },
    });
    if (existingMember) {
      return {
        success: true,
        message: "User is already a member of this workspace",
        member: existingMember,
      };
    }

    // Add them immediately as a workspace member
    const newMember = await this.prisma.client.workspaceMember.create({
      data: {
        workspaceId: id,
        userId: targetUser.id,
        role: "MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return { success: true, message: "Member added successfully", member: newMember };
  }

  @Delete(":id/members/:memberId")
  @ApiOperation({ summary: "Remove a member from a workspace" })
  async removeMember(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;

    // Check if workspace owner/admin
    const activeMember = await this.prisma.client.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId } },
    });
    if (!activeMember || activeMember.role === "MEMBER") {
      throw new ForbiddenException("Only workspace owners or admins can remove members");
    }

    if (memberId === userId) {
      throw new ForbiddenException("You cannot remove yourself from the workspace");
    }

    await this.prisma.client.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId: id, userId: memberId } },
    });

    return { success: true, message: "Member removed successfully" };
  }
}
