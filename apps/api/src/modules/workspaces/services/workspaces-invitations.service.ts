import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { WorkspacesRepository } from "../repositories/workspaces.repository";
import { NotificationsService } from "@/modules/notifications/services/notifications.service";
import { InvitationStatus, NotificationType, WorkspaceRole } from "@finai/database";
import { InviteWorkspaceMemberInput } from "@finai/validation";
import { Logger } from "@yuva-devlab/logger";

@Injectable()
export class WorkspacesInvitationsService {
  private readonly logger = new Logger(WorkspacesInvitationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesRepo: WorkspacesRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async sendInvitation(workspaceId: string, inviterId: string, input: InviteWorkspaceMemberInput) {
    this.logger.info(
      `[sendInvitation] Inviter ${inviterId.slice(0, 8)} inviting ${input.email} to workspace ${workspaceId.slice(0, 8)}`,
    );

    const inviterMember = await this.workspacesRepo.findMember(workspaceId, inviterId);
    if (
      !inviterMember ||
      (inviterMember.role !== WorkspaceRole.OWNER && inviterMember.role !== WorkspaceRole.ADMIN)
    ) {
      throw new ForbiddenException("Only workspace owners or admins can send invitations");
    }

    const workspace = await this.workspacesRepo.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    const email = input.email.trim().toLowerCase();
    const invitee = await this.prisma.client.user.findUnique({
      where: { email },
    });

    if (!invitee) {
      throw new BadRequestException(
        `No registered FinAI user found with email "${input.email}". FinAI invitations require an existing user account.`,
      );
    }

    if (invitee.id === inviterId) {
      throw new BadRequestException("You cannot invite yourself to a workspace");
    }

    const existingMember = await this.workspacesRepo.findMember(workspaceId, invitee.id);
    if (existingMember) {
      throw new BadRequestException("This user is already a member of this workspace");
    }

    const existingInvite = await this.workspacesRepo.findPendingInvitation(workspaceId, invitee.id);
    if (existingInvite) {
      throw new BadRequestException("A pending invitation already exists for this user");
    }

    const role = (input.role as WorkspaceRole) || WorkspaceRole.MEMBER;
    const invitation = await this.workspacesRepo.createInvitation({
      workspaceId,
      inviterId,
      inviteeId: invitee.id,
      email,
      role,
    });

    const inviterUser = await this.prisma.client.user.findUnique({
      where: { id: inviterId },
      select: { name: true },
    });

    await this.notificationsService.createNotification({
      userId: invitee.id,
      type: NotificationType.WORKSPACE_INVITATION,
      title: "Workspace Invitation",
      body: `${inviterUser?.name || "A user"} invited you to join "${workspace.name}" as ${role}`,
      data: {
        workspaceId,
        workspaceName: workspace.name,
        invitationId: invitation.id,
        inviterName: inviterUser?.name || "Workspace Admin",
        role,
      },
    });

    return invitation;
  }

  async listMyPendingInvitations(userId: string) {
    this.logger.info(
      `[listMyPendingInvitations] Listing pending invitations for user ${userId.slice(0, 8)}`,
    );
    return this.workspacesRepo.listPendingInvitationsForUser(userId);
  }

  async acceptInvitation(invitationId: string, userId: string) {
    this.logger.info(
      `[acceptInvitation] User ${userId.slice(0, 8)} accepting invitation ${invitationId.slice(0, 8)}`,
    );
    const invitation = await this.workspacesRepo.findInvitationById(invitationId);
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException("This invitation was not sent to you");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Cannot accept an invitation with status "${invitation.status}"`,
      );
    }

    await this.workspacesRepo.updateInvitationStatus(invitationId, InvitationStatus.ACCEPTED);
    await this.workspacesRepo.addMember(invitation.workspaceId, userId, invitation.role);

    await this.notificationsService.createNotification({
      userId: invitation.inviterId,
      type: NotificationType.WORKSPACE_UPDATE,
      title: "Invitation Accepted",
      body: `${invitation.invitee.name} accepted your invitation to "${invitation.workspace.name}"`,
      data: {
        workspaceId: invitation.workspaceId,
        workspaceName: invitation.workspace.name,
        acceptedUserId: userId,
      },
    });

    return { success: true, workspaceId: invitation.workspaceId };
  }

  async rejectInvitation(invitationId: string, userId: string) {
    this.logger.info(
      `[rejectInvitation] User ${userId.slice(0, 8)} rejecting invitation ${invitationId.slice(0, 8)}`,
    );
    const invitation = await this.workspacesRepo.findInvitationById(invitationId);
    if (!invitation) {
      throw new NotFoundException("Invitation not found");
    }

    if (invitation.inviteeId !== userId) {
      throw new ForbiddenException("This invitation was not sent to you");
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject an invitation with status "${invitation.status}"`,
      );
    }

    await this.workspacesRepo.updateInvitationStatus(invitationId, InvitationStatus.REJECTED);
    return { success: true };
  }

  async cancelInvitation(workspaceId: string, invitationId: string, callerUserId: string) {
    this.logger.info(
      `[cancelInvitation] Caller ${callerUserId.slice(0, 8)} cancelling invite ${invitationId.slice(0, 8)}`,
    );
    const callerMember = await this.workspacesRepo.findMember(workspaceId, callerUserId);
    if (
      !callerMember ||
      (callerMember.role !== WorkspaceRole.OWNER && callerMember.role !== WorkspaceRole.ADMIN)
    ) {
      throw new ForbiddenException("Only workspace owners or admins can cancel invitations");
    }

    const invitation = await this.workspacesRepo.findInvitationById(invitationId);
    if (!invitation || invitation.workspaceId !== workspaceId) {
      throw new NotFoundException("Invitation not found");
    }

    return this.workspacesRepo.updateInvitationStatus(invitationId, InvitationStatus.CANCELLED);
  }
}
