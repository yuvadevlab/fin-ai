import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { WorkspacesMembersService } from "./services/workspaces-members.service";
import {
  updateWorkspaceMemberRoleSchema,
  type UpdateWorkspaceMemberRoleInput,
} from "@finai/validation";
import { WorkspaceRole } from "@finai/database";
import { Logger } from "@yuva-devlab/logger";

@ApiTags("Workspaces Members")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces")
export class WorkspacesMembersController {
  private readonly logger = new Logger(WorkspacesMembersController.name);

  constructor(private readonly membersService: WorkspacesMembersService) {}

  @Get(":id/members")
  @ApiOperation({ summary: "List all members of a workspace" })
  listMembers(@CurrentUser("id") userId: string, @Param("id") workspaceId: string) {
    this.logger.info(`[listMembers] Listing members for workspace ${workspaceId.slice(0, 8)}`);
    return this.membersService.listMembers(workspaceId, userId);
  }

  @Patch(":workspaceId/members/:memberId")
  @ApiOperation({ summary: "Update a member's role in a workspace" })
  updateMemberRole(
    @CurrentUser("id") userId: string,
    @Param("workspaceId") workspaceId: string,
    @Param("memberId") targetUserId: string,
    @Body(new ZodValidationPipe(updateWorkspaceMemberRoleSchema))
    body: UpdateWorkspaceMemberRoleInput,
  ) {
    this.logger.info(
      `[updateMemberRole] User ${userId.slice(0, 8)} updating member ${targetUserId.slice(0, 8)} to ${body.role}`,
    );
    return this.membersService.updateMemberRole(
      workspaceId,
      targetUserId,
      body.role as WorkspaceRole,
      userId,
    );
  }

  @Delete(":workspaceId/members/:memberId")
  @ApiOperation({ summary: "Remove a member from a workspace" })
  removeMember(
    @CurrentUser("id") userId: string,
    @Param("workspaceId") workspaceId: string,
    @Param("memberId") targetUserId: string,
  ) {
    this.logger.info(
      `[removeMember] User ${userId.slice(0, 8)} removing member ${targetUserId.slice(0, 8)}`,
    );
    return this.membersService.removeMember(workspaceId, targetUserId, userId);
  }

  @Post(":id/leave")
  @ApiOperation({ summary: "Leave a shared workspace" })
  leaveWorkspace(@CurrentUser("id") userId: string, @Param("id") workspaceId: string) {
    this.logger.info(
      `[leaveWorkspace] User ${userId.slice(0, 8)} leaving workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.membersService.leaveWorkspace(workspaceId, userId);
  }
}
