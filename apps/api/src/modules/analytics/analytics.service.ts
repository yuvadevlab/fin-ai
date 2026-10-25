import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { DashboardStatsService } from "./services/dashboard-stats.service";
import { SpendingTrendsService } from "./services/spending-trends.service";

/**
 * Facade that preserves the public API for the analytics controller and any
 * agent tooling. All logic lives in DashboardStatsService / SpendingTrendsService.
 */
@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  constructor(
    private dashboard: DashboardStatsService,
    private trends: SpendingTrendsService,
  ) {}

  getDashboard(userId: string, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(`[getDashboard] Computing dashboard for user ${userId.slice(0, 8)}`);
    return this.dashboard.getDashboard(userId, workspaceId, memberUserIds);
  }

  getMonthlyAnalytics(userId: string, months = 6, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(
      `[getMonthlyAnalytics] Computing ${months}-month analytics for user ${userId.slice(0, 8)}`,
    );
    return this.dashboard.getMonthlyAnalytics(userId, months, workspaceId, memberUserIds);
  }

  getSavingsTrend(userId: string, months = 6, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(
      `[getSavingsTrend] Computing ${months}-month savings trend for user ${userId.slice(0, 8)}`,
    );
    return this.dashboard.getSavingsTrend(userId, months, workspaceId, memberUserIds);
  }

  getCategoryBreakdown(userId: string, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(`[getCategoryBreakdown] Computing breakdown for user ${userId.slice(0, 8)}`);
    return this.trends.getCategoryBreakdown(userId, workspaceId, memberUserIds);
  }

  getHealthScore(userId: string, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(`[getHealthScore] Computing health score for user ${userId.slice(0, 8)}`);
    return this.trends.getHealthScore(userId, workspaceId, memberUserIds);
  }

  getRecommendations(userId: string, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(
      `[getRecommendations] Generating recommendations for user ${userId.slice(0, 8)}`,
    );
    return this.trends.getRecommendations(userId, workspaceId, memberUserIds);
  }

  getSafeToSpend(userId: string, workspaceId?: string, memberUserIds?: string[]) {
    this.logger.info(`[getSafeToSpend] Computing safe-to-spend for user ${userId.slice(0, 8)}`);
    return this.trends.getSafeToSpend(userId, workspaceId, memberUserIds);
  }
}
