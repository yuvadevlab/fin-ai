import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { GoalsService } from "@/modules/goals/goals.service";
import {
  createGoalSchema,
  updateGoalSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@finai/validation";

@ApiTags("Goals")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("goals")
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: "List all goals for the current user" })
  findAll(@CurrentUser("id") userId: string) {
    return this.goalsService.findAll(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single goal" })
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.goalsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: "Create a goal" })
  create(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createGoalSchema)) body: CreateGoalInput,
  ) {
    return this.goalsService.create(userId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a goal" })
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateGoalSchema)) body: UpdateGoalInput,
  ) {
    return this.goalsService.update(id, userId, body);
  }

  @Post(":id/contribute")
  @ApiOperation({ summary: "Add money to a goal" })
  contribute(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body("amount") amount: number,
  ) {
    return this.goalsService.contribute(id, userId, amount);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a goal" })
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.goalsService.remove(id, userId);
  }
}
