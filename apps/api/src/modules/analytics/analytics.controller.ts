import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "@/common/guards/workspace.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CurrentWorkspace } from "@/common/decorators/current-workspace.decorator";
import { AnalyticsService } from "@/modules/analytics/analytics.service";
import { Logger } from "@yuva-devlab/logger";

@ApiTags("Analytics")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller("analytics")
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("dashboard")
  @ApiOperation({ summary: "Get dashboard KPIs for the current workspace" })
  getDashboard(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @CurrentWorkspace("memberUserIds") memberUserIds: string[] | undefined,
  ) {
    this.logger.info(
      `[getDashboard] Fetching dashboard for user ${userId.slice(0, 8)} in workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.analyticsService.getDashboard(userId, workspaceId, memberUserIds);
  }

  @Get("monthly")
  @ApiOperation({ summary: "Get monthly cash flow data (last N months)" })
  getMonthly(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @CurrentWorkspace("memberUserIds") memberUserIds: string[] | undefined,
    @Query("months") months?: string,
  ) {
    const parsed = months === "all" ? 120 : months ? parseInt(months, 10) || 3 : 3;
    this.logger.info(
      `[getMonthly] Fetching ${parsed}-month cash flow for workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.analyticsService.getMonthlyAnalytics(userId, parsed, workspaceId, memberUserIds);
  }

  @Get("categories")
  @ApiOperation({ summary: "Get category breakdown for the current month" })
  getCategories(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @CurrentWorkspace("memberUserIds") memberUserIds: string[] | undefined,
  ) {
    this.logger.info(
      `[getCategories] Fetching category breakdown for workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.analyticsService.getCategoryBreakdown(userId, workspaceId, memberUserIds);
  }

  @Get("health")
  @ApiOperation({ summary: "Get financial health score and component metrics" })
  getHealth(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @CurrentWorkspace("memberUserIds") memberUserIds: string[] | undefined,
  ) {
    this.logger.info(`[getHealth] Computing health score for workspace ${workspaceId.slice(0, 8)}`);
    return this.analyticsService.getHealthScore(userId, workspaceId, memberUserIds);
  }

  @Get("savings-trend")
  @ApiOperation({ summary: "Get monthly savings trend (income - expense per month)" })
  getSavingsTrend(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @CurrentWorkspace("memberUserIds") memberUserIds: string[] | undefined,
    @Query("months") months?: string,
  ) {
    const parsed = months ? parseInt(months) : 6;
    this.logger.info(
      `[getSavingsTrend] Fetching ${parsed}-month savings trend for workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.analyticsService.getSavingsTrend(userId, parsed, workspaceId, memberUserIds);
  }
}
