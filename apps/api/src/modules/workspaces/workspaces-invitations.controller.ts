import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { WorkspacesInvitationsService } from "./services/workspaces-invitations.service";
import { inviteWorkspaceMemberSchema, type InviteWorkspaceMemberInput } from "@finai/validation";
import { Logger } from "@yuva-devlab/logger";

@ApiTags("Workspaces Invitations")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces")
export class WorkspacesInvitationsController {
  private readonly logger = new Logger(WorkspacesInvitationsController.name);

  constructor(private readonly invitationsService: WorkspacesInvitationsService) {}

  @Get("invitations/me")
  @ApiOperation({ summary: "List pending workspace invitations for current user" })
  listMyInvitations(@CurrentUser("id") userId: string) {
    this.logger.info(
      `[listMyInvitations] Listing pending invitations for user ${userId.slice(0, 8)}`,
    );
    return this.invitationsService.listMyPendingInvitations(userId);
  }

  @Post(":id/invitations")
  @ApiOperation({ summary: "Invite an existing FinAI user to join a workspace" })
  sendInvitation(
    @CurrentUser("id") userId: string,
    @Param("id") workspaceId: string,
    @Body(new ZodValidationPipe(inviteWorkspaceMemberSchema))
    body: InviteWorkspaceMemberInput,
  ) {
    this.logger.info(
      `[sendInvitation] User ${userId.slice(0, 8)} inviting ${body.email} to workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.invitationsService.sendInvitation(workspaceId, userId, body);
  }

  @Post("invitations/:id/accept")
  @ApiOperation({ summary: "Accept a workspace invitation" })
  acceptInvitation(@CurrentUser("id") userId: string, @Param("id") invitationId: string) {
    this.logger.info(
      `[acceptInvitation] User ${userId.slice(0, 8)} accepting invitation ${invitationId.slice(0, 8)}`,
    );
    return this.invitationsService.acceptInvitation(invitationId, userId);
  }

  @Post("invitations/:id/reject")
  @ApiOperation({ summary: "Reject a workspace invitation" })
  rejectInvitation(@CurrentUser("id") userId: string, @Param("id") invitationId: string) {
    this.logger.info(
      `[rejectInvitation] User ${userId.slice(0, 8)} rejecting invitation ${invitationId.slice(0, 8)}`,
    );
    return this.invitationsService.rejectInvitation(invitationId, userId);
  }

  @Delete(":workspaceId/invitations/:id")
  @ApiOperation({ summary: "Cancel a pending workspace invitation" })
  cancelInvitation(
    @CurrentUser("id") userId: string,
    @Param("workspaceId") workspaceId: string,
    @Param("id") invitationId: string,
  ) {
    this.logger.info(
      `[cancelInvitation] User ${userId.slice(0, 8)} cancelling invite ${invitationId.slice(0, 8)}`,
    );
    return this.invitationsService.cancelInvitation(workspaceId, invitationId, userId);
  }
}
