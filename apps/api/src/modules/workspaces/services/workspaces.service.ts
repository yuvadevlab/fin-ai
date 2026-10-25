import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { WorkspacesRepository } from "../repositories/workspaces.repository";
import { Workspace, WorkspaceRole, WorkspaceType } from "@finai/database";
import { CreateWorkspaceInput, UpdateWorkspaceInput } from "@finai/validation";
import { Logger } from "@yuva-devlab/logger";

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(private readonly workspacesRepo: WorkspacesRepository) {}

  private readonly inFlightPersonalProvisioning = new Map<string, Promise<Workspace>>();

  async getOrCreatePersonalWorkspace(userId: string, userName?: string): Promise<Workspace> {
    const existing = await this.workspacesRepo.findPersonalWorkspace(userId);
    if (existing) {
      return existing;
    }

    const inFlight = this.inFlightPersonalProvisioning.get(userId);
    if (inFlight) {
      return inFlight;
    }

    const task = (async () => {
      try {
        const doubleCheck = await this.workspacesRepo.findPersonalWorkspace(userId);
        if (doubleCheck) return doubleCheck;

        this.logger.info(
          `[getOrCreatePersonalWorkspace] Auto-provisioning personal workspace for user ${userId.slice(0, 8)}`,
        );
        return await this.workspacesRepo.createPersonalWorkspace(userId, userName);
      } finally {
        this.inFlightPersonalProvisioning.delete(userId);
      }
    })();

    this.inFlightPersonalProvisioning.set(userId, task);
    return task;
  }

  async getUserWorkspaces(userId: string, userName?: string) {
    this.logger.info(`[getUserWorkspaces] Listing workspaces for user ${userId.slice(0, 8)}`);
    // Ensure personal workspace exists
    await this.getOrCreatePersonalWorkspace(userId, userName);
    return this.workspacesRepo.findUserWorkspaces(userId);
  }

  async getWorkspace(workspaceId: string, userId: string) {
    this.logger.info(
      `[getWorkspace] Getting workspace ${workspaceId.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const workspace = await this.workspacesRepo.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    const member = await this.workspacesRepo.findMember(workspaceId, userId);
    if (!member && workspace.ownerId !== userId) {
      throw new ForbiddenException("You do not have access to this workspace");
    }

    const role = member ? member.role : WorkspaceRole.OWNER;
    return {
      ...workspace,
      role,
      memberCount: workspace._count.members,
    };
  }

  async createWorkspace(userId: string, input: CreateWorkspaceInput) {
    this.logger.info(
      `[createWorkspace] User ${userId.slice(0, 8)} creating workspace "${input.name}"`,
    );
    return this.workspacesRepo.createWorkspace(userId, {
      name: input.name,
      type: WorkspaceType.SHARED,
    });
  }

  async updateWorkspace(workspaceId: string, userId: string, input: UpdateWorkspaceInput) {
    this.logger.info(
      `[updateWorkspace] User ${userId.slice(0, 8)} updating workspace ${workspaceId.slice(0, 8)}`,
    );
    const member = await this.workspacesRepo.findMember(workspaceId, userId);
    if (!member || (member.role !== WorkspaceRole.OWNER && member.role !== WorkspaceRole.ADMIN)) {
      throw new ForbiddenException("Only workspace owners or admins can update workspace details");
    }

    return this.workspacesRepo.updateWorkspace(workspaceId, { name: input.name });
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    this.logger.info(
      `[deleteWorkspace] User ${userId.slice(0, 8)} deleting workspace ${workspaceId.slice(0, 8)}`,
    );
    const workspace = await this.workspacesRepo.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    if (workspace.type === WorkspaceType.PERSONAL) {
      throw new BadRequestException("Personal workspaces cannot be deleted");
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException("Only the workspace owner can delete this workspace");
    }

    return this.workspacesRepo.deleteWorkspace(workspaceId);
  }
}
