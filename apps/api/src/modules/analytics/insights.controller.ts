import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AnalyticsService } from "./analytics.service";
import { Logger } from "@finai/logger";

@ApiTags("Insights")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("insights")
export class InsightsController {
  private readonly logger = new Logger(InsightsController.name);
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("recommendations")
  @ApiOperation({ summary: "Get deterministic prioritized financial recommendations" })
  getRecommendations(@CurrentUser("id") userId: string) {
    this.logger.debug(
      `[GET /insights/recommendations] Generating recommendations for user ${userId.slice(0, 8)}`,
    );
    return this.analyticsService.getRecommendations(userId);
  }
}
