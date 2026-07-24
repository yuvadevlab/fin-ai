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
  BadRequestException,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "crypto";
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
    const sourceWorkspace = await this.prisma.client.workspace.findUnique({
      where: { id },
    });
    if (!sourceWorkspace) {
      throw new NotFoundException("Workspace not found");
    }

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

    // Check if there is already a pending invitation
    const existingPending = await this.prisma.client.workspaceInvite.findFirst({
      where: {
        workspaceId: id,
        email: body.email,
        status: "PENDING",
        expiresAt: { gte: new Date() },
      },
    });

    if (existingPending) {
      return {
        success: true,
        message: "An invitation has already been sent to this user",
        invite: existingPending,
      };
    }

    const inviterName = req.user.name || "Someone";
    const inviteToken = randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await this.prisma.client.workspaceInvite.create({
      data: {
        workspaceId: id,
        email: body.email,
        role: "MEMBER",
        token: inviteToken,
        invitedById: userId,
        expiresAt,
        status: "PENDING",
      },
    });

    // Create a Notification for the target user
    await this.prisma.client.notification.create({
      data: {
        userId: targetUser.id,
        type: "WORKSPACE_INVITE",
        title: "Workspace Invitation",
        body: `${inviterName} has invited you to join the workspace "${sourceWorkspace.name}"`,
        read: false,
      },
    });

    return { success: true, message: "Invitation sent successfully", invite };
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

  @Get("invites/pending")
  @ApiOperation({ summary: "Get all pending invites for the logged-in user" })
  async getPendingInvites(@Req() req: AuthenticatedRequest) {
    const userEmail = req.user.email;
    return this.prisma.client.workspaceInvite.findMany({
      where: {
        email: userEmail,
        status: "PENDING",
        expiresAt: { gte: new Date() },
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  @Get(":id/invites")
  @ApiOperation({ summary: "Get pending invites sent from a workspace" })
  async getWorkspaceInvites(@Param("id") id: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const isMember = await this.prisma.client.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId } },
    });
    if (!isMember) {
      throw new ForbiddenException("You are not a member of this workspace");
    }

    return this.prisma.client.workspaceInvite.findMany({
      where: { workspaceId: id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
  }

  @Post("invites/:inviteId/accept")
  @ApiOperation({ summary: "Accept a workspace invitation" })
  async acceptInvite(@Param("inviteId") inviteId: string, @Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const invite = await this.prisma.client.workspaceInvite.findUnique({
      where: { id: inviteId },
      include: { workspace: true },
    });

    if (!invite) {
      throw new NotFoundException("Invitation not found");
    }

    if (invite.email !== userEmail) {
      throw new ForbiddenException("This invitation is not for you");
    }

    if (invite.status !== "PENDING") {
      throw new BadRequestException(
        `This invitation has already been ${invite.status.toLowerCase()}`,
      );
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException("This invitation has expired");
    }

    return this.prisma.client.$transaction(async (tx) => {
      // Check if already a member
      const existingMember = await tx.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId } },
      });

      if (!existingMember) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: invite.workspaceId,
            userId,
            role: invite.role,
          },
        });
      }

      const updatedInvite = await tx.workspaceInvite.update({
        where: { id: inviteId },
        data: {
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Successfully joined the workspace",
        invite: updatedInvite,
      };
    });
  }

  @Post("invites/:inviteId/reject")
  @ApiOperation({ summary: "Reject a workspace invitation" })
  async rejectInvite(@Param("inviteId") inviteId: string, @Req() req: AuthenticatedRequest) {
    const userEmail = req.user.email;

    const invite = await this.prisma.client.workspaceInvite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new NotFoundException("Invitation not found");
    }

    if (invite.email !== userEmail) {
      throw new ForbiddenException("This invitation is not for you");
    }

    if (invite.status !== "PENDING") {
      throw new BadRequestException(
        `This invitation has already been ${invite.status.toLowerCase()}`,
      );
    }

    const updatedInvite = await this.prisma.client.workspaceInvite.update({
      where: { id: inviteId },
      data: {
        status: "REJECTED",
      },
    });

    return {
      success: true,
      message: "Invitation rejected",
      invite: updatedInvite,
    };
  }

  @Post(":id/migrate")
  @ApiOperation({ summary: "Duplicate/migrate accounts and categories to another workspace" })
  async migrateRecords(
    @Param("id") sourceWorkspaceId: string,
    @Body()
    body: {
      targetWorkspaceId: string;
      accountIds: string[];
      categoryIds: string[];
    },
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.id;

    // Verify membership in source workspace
    const sourceMember = await this.prisma.client.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: sourceWorkspaceId, userId } },
    });
    if (!sourceMember) {
      throw new ForbiddenException("You are not a member of the source workspace");
    }

    // Verify membership in target workspace
    const targetMember = await this.prisma.client.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: body.targetWorkspaceId, userId } },
    });
    if (!targetMember) {
      throw new ForbiddenException("You are not a member of the target workspace");
    }

    // Duplicate custom categories
    let copiedCategoriesCount = 0;
    if (body.categoryIds && body.categoryIds.length > 0) {
      const categories = await this.prisma.client.category.findMany({
        where: {
          id: { in: body.categoryIds },
          workspaceId: sourceWorkspaceId,
        },
      });

      for (const cat of categories) {
        const existing = await this.prisma.client.category.findFirst({
          where: {
            name: { equals: cat.name, mode: "insensitive" },
            OR: [{ workspaceId: body.targetWorkspaceId }, { workspaceId: null }],
          },
        });

        if (!existing) {
          await this.prisma.client.category.create({
            data: {
              workspaceId: body.targetWorkspaceId,
              name: cat.name,
              group: cat.group,
              icon: cat.icon,
              isSystem: false,
            },
          });
          copiedCategoriesCount++;
        }
      }
    }

    // Duplicate accounts
    let copiedAccountsCount = 0;
    if (body.accountIds && body.accountIds.length > 0) {
      const accounts = await this.prisma.client.account.findMany({
        where: {
          id: { in: body.accountIds },
          workspaceId: sourceWorkspaceId,
          isActive: true,
        },
      });

      for (const acc of accounts) {
        await this.prisma.client.account.create({
          data: {
            workspaceId: body.targetWorkspaceId,
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            currency: acc.currency,
            isActive: true,
          },
        });
        copiedAccountsCount++;
      }
    }

    return {
      success: true,
      message: `Successfully duplicated ${copiedAccountsCount} accounts and ${copiedCategoriesCount} categories.`,
    };
  }
}
