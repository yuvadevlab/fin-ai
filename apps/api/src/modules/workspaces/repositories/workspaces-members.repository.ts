import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { WorkspaceMember, WorkspaceRole } from "@finai/database";

@Injectable()
export class WorkspacesMembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMember(workspaceId: string, userId: string): Promise<WorkspaceMember | null> {
    return this.prisma.client.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async findMemberById(memberId: string): Promise<WorkspaceMember | null> {
    return this.prisma.client.workspaceMember.findUnique({
      where: { id: memberId },
    });
  }

  async listMembers(workspaceId: string) {
    return this.prisma.client.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    return this.prisma.client.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
      data: { role },
    });
  }

  async removeMember(workspaceId: string, userId: string): Promise<WorkspaceMember> {
    return this.prisma.client.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMember> {
    return this.prisma.client.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
      },
    });
  }
}
