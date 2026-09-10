import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AnalyticsService } from "./analytics.service";

@ApiTags("Insights")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("insights")
export class InsightsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("recommendations")
  @ApiOperation({ summary: "Get deterministic prioritized financial recommendations" })
  getRecommendations(@CurrentUser("id") userId: string) {
    return this.analyticsService.getRecommendations(userId);
  }
}
