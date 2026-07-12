import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard KPIs for a workspace" })
  getDashboard(@Param("workspaceId") workspaceId: string) {
    return this.analyticsService.getDashboard(workspaceId);
  }

  @Get("monthly")
  @ApiOperation({ summary: "Get monthly cash flow data (last N months)" })
  getMonthly(@Param("workspaceId") workspaceId: string, @Query("months") months?: string) {
    return this.analyticsService.getMonthlyAnalytics(workspaceId, months ? parseInt(months) : 6);
  }

  @Get("categories")
  @ApiOperation({ summary: "Get category breakdown for the current month" })
  getCategories(@Param("workspaceId") workspaceId: string) {
    return this.analyticsService.getCategoryBreakdown(workspaceId);
  }
}
