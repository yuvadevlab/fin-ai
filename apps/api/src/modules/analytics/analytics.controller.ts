import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { AnalyticsService } from "@/modules/analytics/analytics.service";

@ApiTags("Analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard KPIs for the current user" })
  getDashboard(@CurrentUser("id") userId: string) {
    return this.analyticsService.getDashboard(userId);
  }

  @Get("monthly")
  @ApiOperation({ summary: "Get monthly cash flow data (last N months)" })
  getMonthly(@CurrentUser("id") userId: string, @Query("months") months?: string) {
    return this.analyticsService.getMonthlyAnalytics(userId, months ? parseInt(months) : 6);
  }

  @Get("categories")
  @ApiOperation({ summary: "Get category breakdown for the current month" })
  getCategories(@CurrentUser("id") userId: string) {
    return this.analyticsService.getCategoryBreakdown(userId);
  }

  @Get("health")
  @ApiOperation({ summary: "Get financial health score and component metrics" })
  getHealth(@CurrentUser("id") userId: string) {
    return this.analyticsService.getHealthScore(userId);
  }

  @Get("savings-trend")
  @ApiOperation({ summary: "Get monthly savings trend (income - expense per month)" })
  getSavingsTrend(@CurrentUser("id") userId: string, @Query("months") months?: string) {
    return this.analyticsService.getSavingsTrend(userId, months ? parseInt(months) : 6);
  }
}
