import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { InvestmentsService } from "./investments.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { createInvestmentSchema, CreateInvestmentInput } from "@finai/validation";

@ApiTags("Investments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/investments")
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get()
  @ApiOperation({
    summary: "Get portfolio with total value and asset allocation",
  })
  findAll(@Param("workspaceId") workspaceId: string) {
    return this.investmentsService.findAll(workspaceId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single investment" })
  findOne(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.investmentsService.findOne(id, workspaceId);
  }

  @Post()
  @ApiOperation({ summary: "Add an investment" })
  create(
    @Param("workspaceId") workspaceId: string,
    @Body(new ZodValidationPipe(createInvestmentSchema))
    body: CreateInvestmentInput,
  ) {
    return this.investmentsService.create(workspaceId, body);
  }

  @Patch(":id/value")
  @ApiOperation({ summary: "Update the current market value of an investment" })
  updateValue(
    @Param("workspaceId") workspaceId: string,
    @Param("id") id: string,
    @Body("currentValue") currentValue: number,
  ) {
    return this.investmentsService.updateValue(id, workspaceId, currentValue);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove an investment" })
  remove(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.investmentsService.remove(id, workspaceId);
  }
}
