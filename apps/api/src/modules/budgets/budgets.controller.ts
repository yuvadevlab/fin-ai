import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { BudgetsService } from "@/modules/budgets/budgets.service";
import {
  createBudgetSchema,
  updateBudgetSchema,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "@finai/validation";

@ApiTags("Budgets")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("budgets")
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  @ApiOperation({
    summary: "List all budgets for the current user (with spending data)",
  })
  findAll(@CurrentUser("id") userId: string) {
    return this.budgetsService.findAll(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single budget" })
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.budgetsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: "Create a budget" })
  create(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createBudgetSchema)) body: CreateBudgetInput,
  ) {
    return this.budgetsService.create(userId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a budget" })
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateBudgetSchema)) body: UpdateBudgetInput,
  ) {
    return this.budgetsService.update(id, userId, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a budget" })
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.budgetsService.remove(id, userId);
  }
}
