import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { AccountsService } from "@/modules/accounts/accounts.service";
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
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "List all accounts for the current user" })
  findAll(@CurrentUser("id") userId: string) {
    return this.accountsService.findAll(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single account" })
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.accountsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: "Create an account" })
  create(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createAccountSchema)) body: CreateAccountInput,
  ) {
    return this.accountsService.create(userId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an account" })
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateAccountSchema)) body: UpdateAccountInput,
  ) {
    return this.accountsService.update(id, userId, body);
  }

  @Patch(":id/default")
  @ApiOperation({ summary: "Set an account as the default account" })
  setDefault(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.accountsService.setDefault(id, userId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete an account" })
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.accountsService.remove(id, userId);
  }
}
