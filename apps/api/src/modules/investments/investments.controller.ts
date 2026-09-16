import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { InvestmentsService } from "./investments.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { Logger } from "@finai/logger";
import {
  createInvestmentSchema,
  updateInvestmentValueSchema,
  type CreateInvestmentInput,
  type UpdateInvestmentValueInput,
} from "@finai/validation";

@ApiTags("Investments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("investments")
export class InvestmentsController {
  private readonly logger = new Logger(InvestmentsController.name);
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get()
  @ApiOperation({
    summary: "Get portfolio with total value and asset allocation",
  })
  findAll(@CurrentUser("id") userId: string) {
    this.logger.debug(`[GET /investments] Fetching portfolio for user ${userId.slice(0, 8)}`);
    return this.investmentsService.findAll(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single investment" })
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.debug(
      `[GET /investments/:id] Fetching investment ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.investmentsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: "Add an investment" })
  create(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createInvestmentSchema))
    body: CreateInvestmentInput,
  ) {
    this.logger.info(
      `[POST /investments] Adding investment "${body.name}" [${body.assetClass}] (user: ${userId.slice(0, 8)})`,
    );
    return this.investmentsService.create(userId, body);
  }

  @Patch(":id/value")
  @ApiOperation({ summary: "Update the current market value of an investment" })
  updateValue(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateInvestmentValueSchema)) body: UpdateInvestmentValueInput,
  ) {
    this.logger.info(
      `[PATCH /investments/:id/value] Updating investment ${id.slice(0, 8)} to ${body.currentValue} (user: ${userId.slice(0, 8)})`,
    );
    return this.investmentsService.updateValue(id, userId, body.currentValue);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove an investment" })
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.info(
      `[DELETE /investments/:id] Removing investment ${id.slice(0, 8)} (user: ${userId.slice(0, 8)})`,
    );
    return this.investmentsService.remove(id, userId);
  }
}
