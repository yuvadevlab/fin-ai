import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "@/common/guards/workspace.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CurrentWorkspace } from "@/common/decorators/current-workspace.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { AccountsService } from "@/modules/accounts/accounts.service";
import { Logger } from "@yuva-devlab/logger";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@finai/validation";

@ApiTags("Accounts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller("accounts")
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "List all accounts for the current workspace" })
  findAll(@CurrentUser("id") userId: string, @CurrentWorkspace("id") workspaceId: string) {
    this.logger.info(
      `[findAll] Listing accounts for user ${userId.slice(0, 8)} in workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.accountsService.findAll(userId, workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single account" })
  findOne(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Param("id") id: string,
  ) {
    this.logger.info(
      `[findOne] Looking up account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.accountsService.findOne(id, userId, workspaceId);
  }

  @Post()
  @ApiOperation({ summary: "Create an account in the current workspace" })
  create(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Body(new ZodValidationPipe(createAccountSchema)) body: CreateAccountInput,
  ) {
    this.logger.info(
      `[create] Creating account "${body.name}" [${body.type}] in workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.accountsService.create(userId, body, workspaceId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an account" })
  update(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateAccountSchema)) body: UpdateAccountInput,
  ) {
    this.logger.info(`[update] Updating account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return this.accountsService.update(id, userId, body, workspaceId);
  }

  @Patch(":id/default")
  @ApiOperation({ summary: "Set an account as the default account" })
  setDefault(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Param("id") id: string,
  ) {
    this.logger.info(
      `[setDefault] Setting default account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.accountsService.setDefault(id, userId, workspaceId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete an account" })
  remove(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Param("id") id: string,
  ) {
    this.logger.info(
      `[remove] Soft-deleting account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.accountsService.remove(id, userId, workspaceId);
  }
}
