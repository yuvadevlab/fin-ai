import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { GoalsService } from "@/modules/goals/goals.service";
import { Logger } from "@yuva-devlab/logger";
import {
  createGoalSchema,
  updateGoalSchema,
  contributeAmountSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
  type ContributeAmountInput,
} from "@finai/validation";

@ApiTags("Goals")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("goals")
export class GoalsController {
  private readonly logger = new Logger(GoalsController.name);
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: "List all goals for the current user" })
  findAll(@CurrentUser("id") userId: string) {
    this.logger.debug(`[GET /goals] Listing goals for user ${userId.slice(0, 8)}`);
    return this.goalsService.findAll(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single goal" })
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.debug(
      `[GET /goals/:id] Fetching goal ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.goalsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: "Create a goal" })
  create(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createGoalSchema)) body: CreateGoalInput,
  ) {
    this.logger.info(
      `[POST /goals] Creating goal "${body.name}" target: ${body.targetAmount} (user: ${userId.slice(0, 8)})`,
    );
    return this.goalsService.create(userId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a goal" })
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateGoalSchema)) body: UpdateGoalInput,
  ) {
    this.logger.info(
      `[PATCH /goals/:id] Updating goal ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.goalsService.update(id, userId, body);
  }

  @Post(":id/contribute")
  @ApiOperation({ summary: "Add money to a goal" })
  contribute(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(contributeAmountSchema)) body: ContributeAmountInput,
  ) {
    this.logger.info(
      `[POST /goals/:id/contribute] Contributing ${body.amount} to goal ${id.slice(0, 8)} (user: ${userId.slice(0, 8)})`,
    );
    return this.goalsService.contribute(id, userId, body.amount);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a goal" })
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.info(
      `[DELETE /goals/:id] Deleting goal ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.goalsService.remove(id, userId);
  }
}
