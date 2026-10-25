import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { WorkspacesService } from "./services/workspaces.service";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
} from "@finai/validation";
import { Logger } from "@yuva-devlab/logger";

@ApiTags("Workspaces")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces")
export class WorkspacesController {
  private readonly logger = new Logger(WorkspacesController.name);

  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @ApiOperation({ summary: "List all workspaces for the current user" })
  listUserWorkspaces(@CurrentUser("id") userId: string, @CurrentUser("name") userName?: string) {
    this.logger.info(`[listUserWorkspaces] Listing workspaces for user ${userId.slice(0, 8)}`);
    return this.workspacesService.getUserWorkspaces(userId, userName);
  }

  @Get("current")
  @ApiOperation({ summary: "Get the current active workspace" })
  async getCurrentWorkspace(
    @CurrentUser("id") userId: string,
    @CurrentUser("name") userName?: string,
    @Headers("x-workspace-id") workspaceIdHeader?: string,
  ) {
    this.logger.info(
      `[getCurrentWorkspace] Resolving current workspace for user ${userId.slice(0, 8)}`,
    );
    if (workspaceIdHeader) {
      return this.workspacesService.getWorkspace(workspaceIdHeader, userId);
    }
    const personal = await this.workspacesService.getOrCreatePersonalWorkspace(userId, userName);
    return this.workspacesService.getWorkspace(personal.id, userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get workspace details by ID" })
  getWorkspace(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.info(
      `[getWorkspace] Looking up workspace ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.workspacesService.getWorkspace(id, userId);
  }

  @Post()
  @ApiOperation({ summary: "Create a new family workspace" })
  createWorkspace(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createWorkspaceSchema)) body: CreateWorkspaceInput,
  ) {
    this.logger.info(
      `[createWorkspace] Creating workspace "${body.name}" for user ${userId.slice(0, 8)}`,
    );
    return this.workspacesService.createWorkspace(userId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update workspace metadata" })
  updateWorkspace(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateWorkspaceSchema)) body: UpdateWorkspaceInput,
  ) {
    this.logger.info(
      `[updateWorkspace] Updating workspace ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.workspacesService.updateWorkspace(id, userId, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a shared workspace" })
  deleteWorkspace(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.info(
      `[deleteWorkspace] Deleting workspace ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.workspacesService.deleteWorkspace(id, userId);
  }
}
