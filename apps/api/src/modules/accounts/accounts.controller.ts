import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AccountsService } from "./accounts.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import {
  createAccountSchema,
  updateAccountSchema,
  CreateAccountInput,
  UpdateAccountInput,
} from "@finai/validation";

@ApiTags("Accounts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "List all accounts in a workspace" })
  findAll(@Param("workspaceId") workspaceId: string) {
    return this.accountsService.findAll(workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single account" })
  findOne(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.accountsService.findOne(id, workspaceId);
  }

  @Post()
  @ApiOperation({ summary: "Create an account" })
  create(
    @Param("workspaceId") workspaceId: string,
    @Body(new ZodValidationPipe(createAccountSchema)) body: CreateAccountInput,
  ) {
    return this.accountsService.create(workspaceId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an account" })
  update(
    @Param("workspaceId") workspaceId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateAccountSchema)) body: UpdateAccountInput,
  ) {
    return this.accountsService.update(id, workspaceId, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft-delete an account" })
  remove(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.accountsService.remove(id, workspaceId);
  }
}
