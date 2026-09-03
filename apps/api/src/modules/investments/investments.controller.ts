import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { InvestmentsService } from "./investments.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { createInvestmentSchema, type CreateInvestmentInput } from "@finai/validation";

@ApiTags("Investments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("investments")
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get()
  @ApiOperation({
    summary: "Get portfolio with total value and asset allocation",
  })
  findAll(@CurrentUser("id") userId: string) {
    return this.investmentsService.findAll(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single investment" })
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.investmentsService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: "Add an investment" })
  create(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createInvestmentSchema))
    body: CreateInvestmentInput,
  ) {
    return this.investmentsService.create(userId, body);
  }

  @Patch(":id/value")
  @ApiOperation({ summary: "Update the current market value of an investment" })
  updateValue(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body("currentValue") currentValue: number,
  ) {
    return this.investmentsService.updateValue(id, userId, currentValue);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove an investment" })
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.investmentsService.remove(id, userId);
  }
}
