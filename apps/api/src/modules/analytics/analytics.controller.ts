import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AnalyticsService } from "@/modules/analytics/analytics.service";
import { Logger } from "@yuva-devlab/logger";

@ApiTags("Analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard KPIs for the current user" })
  getDashboard(@CurrentUser("id") userId: string) {
    this.logger.info(`[getDashboard] Fetching dashboard for user ${userId.slice(0, 8)}`);
    return this.analyticsService.getDashboard(userId);
  }

  @Get("monthly")
  @ApiOperation({ summary: "Get monthly cash flow data (last N months)" })
  getMonthly(@CurrentUser("id") userId: string, @Query("months") months?: string) {
    const parsed = months === "all" ? 120 : months ? parseInt(months, 10) || 3 : 3;
    this.logger.info(
      `[getMonthly] Fetching ${parsed}-month cash flow for user ${userId.slice(0, 8)}`,
    );
    return this.analyticsService.getMonthlyAnalytics(userId, parsed);
  }

  @Get("categories")
  @ApiOperation({ summary: "Get category breakdown for the current month" })
  getCategories(@CurrentUser("id") userId: string) {
    this.logger.info(`[getCategories] Fetching category breakdown for user ${userId.slice(0, 8)}`);
    return this.analyticsService.getCategoryBreakdown(userId);
  }

  @Get("health")
  @ApiOperation({ summary: "Get financial health score and component metrics" })
  getHealth(@CurrentUser("id") userId: string) {
    this.logger.info(`[getHealth] Computing health score for user ${userId.slice(0, 8)}`);
    return this.analyticsService.getHealthScore(userId);
  }

  @Get("savings-trend")
  @ApiOperation({ summary: "Get monthly savings trend (income - expense per month)" })
  getSavingsTrend(@CurrentUser("id") userId: string, @Query("months") months?: string) {
    const parsed = months ? parseInt(months) : 6;
    this.logger.info(
      `[getSavingsTrend] Fetching ${parsed}-month savings trend for user ${userId.slice(0, 8)}`,
    );
    return this.analyticsService.getSavingsTrend(userId, parsed);
  }
}
