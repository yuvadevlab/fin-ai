import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { AccountsService } from "@/modules/accounts/accounts.service";
import { Logger } from "@finai/logger";
import {
  createAccountSchema,
  updateAccountSchema,
  type CreateAccountInput,
  type UpdateAccountInput,
} from "@finai/validation";

@ApiTags("Accounts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("accounts")
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "List all accounts for the current user" })
  findAll(@CurrentUser("id") userId: string) {
    this.logger.debug(`[GET /accounts] Listing all accounts for user ${userId.slice(0, 8)}`);
    return this.accountsService.findAll(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single account" })
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.debug(
      `[GET /accounts/:id] Looking up account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.accountsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: "Create an account" })
  create(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createAccountSchema)) body: CreateAccountInput,
  ) {
    this.logger.info(
      `[POST /accounts] Creating account "${body.name}" [${body.type}] for user ${userId.slice(0, 8)}`,
    );
    return this.accountsService.create(userId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an account" })
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateAccountSchema)) body: UpdateAccountInput,
  ) {
    this.logger.info(
      `[PATCH /accounts/:id] Updating account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.accountsService.update(id, userId, body);
  }

  @Patch(":id/default")
  @ApiOperation({ summary: "Set an account as the default account" })
  setDefault(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.info(
      `[PATCH /accounts/:id/default] Setting default account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.accountsService.setDefault(id, userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete an account" })
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.info(
      `[DELETE /accounts/:id] Soft-deleting account ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.accountsService.remove(id, userId);
  }
}
