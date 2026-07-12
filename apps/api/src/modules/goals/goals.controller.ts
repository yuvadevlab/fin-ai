import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { GoalsService } from "./goals.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import {
  createGoalSchema,
  updateGoalSchema,
  CreateGoalInput,
  UpdateGoalInput,
} from "@finai/validation";

@ApiTags("Goals")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/goals")
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  @ApiOperation({ summary: "List all goals in a workspace" })
  findAll(@Param("workspaceId") workspaceId: string) {
    return this.goalsService.findAll(workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single goal" })
  findOne(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.goalsService.findOne(id, workspaceId);
  }

  @Post()
  @ApiOperation({ summary: "Create a goal" })
  create(
    @Param("workspaceId") workspaceId: string,
    @Body(new ZodValidationPipe(createGoalSchema)) body: CreateGoalInput,
  ) {
    return this.goalsService.create(workspaceId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a goal" })
  update(
    @Param("workspaceId") workspaceId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateGoalSchema)) body: UpdateGoalInput,
  ) {
    return this.goalsService.update(id, workspaceId, body);
  }

  @Post(":id/contribute")
  @ApiOperation({ summary: "Add money to a goal" })
  contribute(
    @Param("workspaceId") workspaceId: string,
    @Param("id") id: string,
    @Body("amount") amount: number,
  ) {
    return this.goalsService.contribute(id, workspaceId, amount);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a goal" })
  remove(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.goalsService.remove(id, workspaceId);
  }
}
