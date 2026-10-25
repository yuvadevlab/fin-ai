import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { WorkspacesRepository } from "../repositories/workspaces.repository";
import { NotificationsService } from "@/modules/notifications/services/notifications.service";
import { NotificationType, WorkspaceRole, WorkspaceType } from "@finai/database";
import { Logger } from "@yuva-devlab/logger";

@Injectable()
export class WorkspacesMembersService {
  private readonly logger = new Logger(WorkspacesMembersService.name);

  constructor(
    private readonly workspacesRepo: WorkspacesRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listMembers(workspaceId: string, userId: string) {
    this.logger.info(
      `[listMembers] Listing members for workspace ${workspaceId.slice(0, 8)} by user ${userId.slice(0, 8)}`,
    );
    const membership = await this.workspacesRepo.findMember(workspaceId, userId);
    if (!membership) {
      throw new ForbiddenException("You do not have access to this workspace");
    }

    return this.workspacesRepo.listMembers(workspaceId);
  }

  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    role: WorkspaceRole,
    callerUserId: string,
  ) {
    this.logger.info(
      `[updateMemberRole] Caller ${callerUserId.slice(0, 8)} updating role for ${targetUserId.slice(0, 8)} to ${role}`,
    );
    const callerMember = await this.workspacesRepo.findMember(workspaceId, callerUserId);
    if (
      !callerMember ||
      (callerMember.role !== WorkspaceRole.OWNER && callerMember.role !== WorkspaceRole.ADMIN)
    ) {
      throw new ForbiddenException("Only workspace owners or admins can update member roles");
    }

    const targetMember = await this.workspacesRepo.findMember(workspaceId, targetUserId);
    if (!targetMember) {
      throw new NotFoundException("Workspace member not found");
    }

    if (targetMember.role === WorkspaceRole.OWNER) {
      throw new BadRequestException("Workspace owner's role cannot be modified");
    }

    return this.workspacesRepo.updateMemberRole(workspaceId, targetUserId, role);
  }

  async removeMember(workspaceId: string, targetUserId: string, callerUserId: string) {
    this.logger.info(
      `[removeMember] Caller ${callerUserId.slice(0, 8)} removing member ${targetUserId.slice(0, 8)} from workspace ${workspaceId.slice(0, 8)}`,
    );
    const callerMember = await this.workspacesRepo.findMember(workspaceId, callerUserId);
    if (
      !callerMember ||
      (callerMember.role !== WorkspaceRole.OWNER && callerMember.role !== WorkspaceRole.ADMIN)
    ) {
      throw new ForbiddenException("Only workspace owners or admins can remove members");
    }

    const targetMember = await this.workspacesRepo.findMember(workspaceId, targetUserId);
    if (!targetMember) {
      throw new NotFoundException("Workspace member not found");
    }

    if (targetMember.role === WorkspaceRole.OWNER) {
      throw new BadRequestException("Cannot remove the workspace owner");
    }

    if (callerMember.role === WorkspaceRole.ADMIN && targetMember.role === WorkspaceRole.ADMIN) {
      throw new ForbiddenException("Admins cannot remove other admins");
    }

    const workspace = await this.workspacesRepo.findById(workspaceId);
    const removed = await this.workspacesRepo.removeMember(workspaceId, targetUserId);

    if (workspace) {
      await this.notificationsService.createNotification({
        userId: targetUserId,
        type: NotificationType.WORKSPACE_UPDATE,
        title: "Workspace Update",
        body: `You were removed from workspace "${workspace.name}"`,
        data: { workspaceId, workspaceName: workspace.name },
      });
    }

    return removed;
  }

  async leaveWorkspace(workspaceId: string, userId: string) {
    this.logger.info(
      `[leaveWorkspace] User ${userId.slice(0, 8)} leaving workspace ${workspaceId.slice(0, 8)}`,
    );
    const workspace = await this.workspacesRepo.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    if (workspace.type === WorkspaceType.PERSONAL) {
      throw new BadRequestException("Cannot leave a personal workspace");
    }

    if (workspace.ownerId === userId) {
      throw new BadRequestException(
        "Workspace owner cannot leave the workspace. You can delete it instead.",
      );
    }

    const membership = await this.workspacesRepo.findMember(workspaceId, userId);
    if (!membership) {
      throw new BadRequestException("You are not a member of this workspace");
    }

    const removed = await this.workspacesRepo.removeMember(workspaceId, userId);

    await this.notificationsService.createNotification({
      userId: workspace.ownerId,
      type: NotificationType.WORKSPACE_UPDATE,
      title: "Member Left Workspace",
      body: `A member has left your workspace "${workspace.name}"`,
      data: { workspaceId, workspaceName: workspace.name, userId },
    });

    return removed;
  }
}
