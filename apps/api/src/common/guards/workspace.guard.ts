import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import { WorkspacesService } from "@/modules/workspaces/services/workspaces.service";
import { WorkspaceRole, WorkspaceType } from "@finai/database";
import { Logger } from "@yuva-devlab/logger";

@Injectable()
export class WorkspaceGuard implements CanActivate {
  private readonly logger = new Logger(WorkspaceGuard.name);

  constructor(private readonly workspacesService: WorkspacesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) {
      this.logger.warn("[canActivate] Missing authenticated user in request context");
      throw new UnauthorizedException("User must be authenticated");
    }

    const requestedWorkspaceId = request.headers["x-workspace-id"] as string | undefined;

    let workspace: { id: string; type: WorkspaceType; role: WorkspaceRole };
    let memberUserIds: string[];

    if (!requestedWorkspaceId) {
      const personal = await this.workspacesService.getOrCreatePersonalWorkspace(
        user.id,
        user.name,
      );
      workspace = {
        id: personal.id,
        type: personal.type,
        role: WorkspaceRole.OWNER,
      };
      memberUserIds = [user.id];
    } else {
      try {
        const resolved = await this.workspacesService.getWorkspace(requestedWorkspaceId, user.id);
        workspace = {
          id: resolved.id,
          type: resolved.type,
          role: resolved.role,
        };
        const membersList = (resolved as { members?: Array<{ userId: string }> }).members;
        memberUserIds =
          resolved.type === WorkspaceType.SHARED
            ? Array.from(
                new Set([resolved.ownerId, ...(membersList?.map((m) => m.userId) ?? []), user.id]),
              )
            : [user.id];
      } catch {
        this.logger.warn(
          `[canActivate] User ${user.id.slice(0, 8)} unauthorized for workspace ${requestedWorkspaceId.slice(0, 8)}`,
        );
        throw new ForbiddenException("You do not have access to this workspace");
      }
    }

    const isReadOnly = workspace.type === WorkspaceType.SHARED;

    request.workspaceId = workspace.id;
    request.workspaceRole = workspace.role;
    request.workspaceMemberIds = memberUserIds;
    request.workspace = {
      ...workspace,
      memberUserIds,
    };
    request.isWorkspaceReadOnly = isReadOnly;

    // RBAC: Reject mutations on shared workspaces (view-only mode)
    const method = request.method ? request.method.toUpperCase() : "GET";
    if (isReadOnly && ["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      this.logger.warn(
        `[canActivate] Write ${method} rejected on shared workspace ${workspace.id.slice(0, 8)} by user ${user.id.slice(0, 8)}`,
      );
      throw new ForbiddenException("Shared workspaces are view-only. Modifications are disabled.");
    }

    return true;
  }
}
