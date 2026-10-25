import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { Workspace, WorkspaceType, WorkspaceRole, InvitationStatus } from "@finai/database";
import { WorkspacesMembersRepository } from "./workspaces-members.repository";
import { WorkspacesInvitationsRepository } from "./workspaces-invitations.repository";

@Injectable()
export class WorkspacesRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly membersRepo: WorkspacesMembersRepository,
    private readonly invitationsRepo: WorkspacesInvitationsRepository,
  ) {}

  async findPersonalWorkspace(userId: string): Promise<Workspace | null> {
    return this.prisma.client.workspace.findFirst({
      where: {
        ownerId: userId,
        type: WorkspaceType.PERSONAL,
      },
      include: {
        members: true,
      },
    });
  }

  async createPersonalWorkspace(userId: string, userName?: string): Promise<Workspace> {
    const defaultName = userName ? `${userName}'s Workspace` : "Personal Workspace";
    try {
      return await this.prisma.client.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: { name: defaultName, type: WorkspaceType.PERSONAL, ownerId: userId },
        });

        await tx.workspaceMember.create({
          data: { workspaceId: workspace.id, userId, role: WorkspaceRole.OWNER },
        });

        // Backfill legacy records missing workspace_id to this personal workspace
        const wId = { workspaceId: workspace.id };
        const orphan = { userId, workspaceId: null };
        await Promise.all([
          tx.account.updateMany({ where: orphan, data: wId }),
          tx.transaction.updateMany({ where: orphan, data: wId }),
          tx.category.updateMany({ where: orphan, data: wId }),
          tx.budget.updateMany({ where: orphan, data: wId }),
          tx.goal.updateMany({ where: orphan, data: wId }),
          tx.investment.updateMany({ where: orphan, data: wId }),
        ]);

        return workspace;
      });
    } catch {
      const existing = await this.findPersonalWorkspace(userId);
      if (existing) return existing;
      throw new Error(`Failed to provision personal workspace for user ${userId}`);
    }
  }

  async findUserWorkspaces(userId: string) {
    const memberships = await this.prisma.client.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const userWorkspaces = memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
      memberCount: m.workspace._count.members,
    }));

    const seenPersonal = new Set<string>();
    return userWorkspaces.filter((w) => {
      if (w.type === WorkspaceType.PERSONAL) {
        if (seenPersonal.size > 0) return false;
        seenPersonal.add(w.id);
      }
      return true;
    });
  }

  async findById(workspaceId: string) {
    return this.prisma.client.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { members: true } },
      },
    });
  }

  async createWorkspace(
    ownerId: string,
    data: { name: string; type?: WorkspaceType },
  ): Promise<Workspace> {
    return this.prisma.client.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          type: data.type ?? WorkspaceType.SHARED,
          ownerId,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: ownerId,
          role: WorkspaceRole.OWNER,
        },
      });

      return workspace;
    });
  }

  async updateWorkspace(workspaceId: string, data: { name: string }): Promise<Workspace> {
    return this.prisma.client.workspace.update({
      where: { id: workspaceId },
      data,
    });
  }

  async deleteWorkspace(workspaceId: string): Promise<Workspace> {
    return this.prisma.client.workspace.delete({
      where: { id: workspaceId },
    });
  }

  findMember(workspaceId: string, userId: string) {
    return this.membersRepo.findMember(workspaceId, userId);
  }
  findMemberById(memberId: string) {
    return this.membersRepo.findMemberById(memberId);
  }
  listMembers(workspaceId: string) {
    return this.membersRepo.listMembers(workspaceId);
  }
  updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole) {
    return this.membersRepo.updateMemberRole(workspaceId, userId, role);
  }
  removeMember(workspaceId: string, userId: string) {
    return this.membersRepo.removeMember(workspaceId, userId);
  }
  addMember(workspaceId: string, userId: string, role: WorkspaceRole) {
    return this.membersRepo.addMember(workspaceId, userId, role);
  }

  findInvitationById(id: string) {
    return this.invitationsRepo.findInvitationById(id);
  }
  findPendingInvitation(workspaceId: string, inviteeId: string) {
    return this.invitationsRepo.findPendingInvitation(workspaceId, inviteeId);
  }
  listInvitationsForWorkspace(workspaceId: string) {
    return this.invitationsRepo.listInvitationsForWorkspace(workspaceId);
  }
  listPendingInvitationsForUser(userId: string) {
    return this.invitationsRepo.listPendingInvitationsForUser(userId);
  }
  createInvitation(data: {
    workspaceId: string;
    inviterId: string;
    inviteeId: string;
    email: string;
    role: WorkspaceRole;
  }) {
    return this.invitationsRepo.createInvitation(data);
  }
  updateInvitationStatus(id: string, status: InvitationStatus) {
    return this.invitationsRepo.updateInvitationStatus(id, status);
  }
}
