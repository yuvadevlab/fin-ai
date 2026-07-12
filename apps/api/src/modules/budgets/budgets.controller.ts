import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { BudgetsService } from "./budgets.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import {
  createBudgetSchema,
  updateBudgetSchema,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@finai/validation";

@ApiTags("Budgets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({
    summary: "List all budgets in a workspace (with spending data)",
  })
  findAll(@Param("workspaceId") workspaceId: string) {
    return this.budgetsService.findAll(workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single budget" })
  findOne(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.budgetsService.findOne(id, workspaceId);
  }

  @Post()
  @ApiOperation({ summary: "Create a budget" })
  create(
    @Param("workspaceId") workspaceId: string,
    @Body(new ZodValidationPipe(createBudgetSchema)) body: CreateBudgetInput,
  ) {
    return this.budgetsService.create(workspaceId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a budget" })
  update(
    @Param("workspaceId") workspaceId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateBudgetSchema)) body: UpdateBudgetInput,
  ) {
    return this.budgetsService.update(id, workspaceId, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a budget" })
  remove(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.budgetsService.remove(id, workspaceId);
  }
}
