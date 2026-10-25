import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { WorkspaceInvitation, WorkspaceRole, InvitationStatus } from "@finai/database";

@Injectable()
export class WorkspacesInvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findInvitationById(id: string) {
    return this.prisma.client.workspaceInvitation.findUnique({
      where: { id },
      include: {
        workspace: true,
        inviter: { select: { id: true, name: true, email: true } },
        invitee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findPendingInvitation(
    workspaceId: string,
    inviteeId: string,
  ): Promise<WorkspaceInvitation | null> {
    return this.prisma.client.workspaceInvitation.findFirst({
      where: {
        workspaceId,
        inviteeId,
        status: InvitationStatus.PENDING,
      },
    });
  }

  async listInvitationsForWorkspace(workspaceId: string) {
    return this.prisma.client.workspaceInvitation.findMany({
      where: { workspaceId },
      include: {
        inviter: { select: { id: true, name: true, email: true } },
        invitee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listPendingInvitationsForUser(userId: string) {
    return this.prisma.client.workspaceInvitation.findMany({
      where: {
        inviteeId: userId,
        status: InvitationStatus.PENDING,
      },
      include: {
        workspace: {
          select: { id: true, name: true, type: true, ownerId: true },
        },
        inviter: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createInvitation(data: {
    workspaceId: string;
    inviterId: string;
    inviteeId: string;
    email: string;
    role: WorkspaceRole;
  }): Promise<WorkspaceInvitation> {
    return this.prisma.client.workspaceInvitation.create({
      data: {
        workspaceId: data.workspaceId,
        inviterId: data.inviterId,
        inviteeId: data.inviteeId,
        email: data.email,
        role: data.role,
        status: InvitationStatus.PENDING,
      },
    });
  }

  async updateInvitationStatus(id: string, status: InvitationStatus): Promise<WorkspaceInvitation> {
    return this.prisma.client.workspaceInvitation.update({
      where: { id },
      data: { status },
    });
  }
}
