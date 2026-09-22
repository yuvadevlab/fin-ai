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

  getDashboard(userId: string) {
    this.logger.debug(`[getDashboard] Computing dashboard for user ${userId.slice(0, 8)}`);
    return this.dashboard.getDashboard(userId);
  }

  getMonthlyAnalytics(userId: string, months = 6) {
    this.logger.debug(
      `[getMonthlyAnalytics] Computing ${months}-month analytics for user ${userId.slice(0, 8)}`,
    );
    return this.dashboard.getMonthlyAnalytics(userId, months);
  }

  getSavingsTrend(userId: string, months = 6) {
    this.logger.debug(
      `[getSavingsTrend] Computing ${months}-month savings trend for user ${userId.slice(0, 8)}`,
    );
    return this.dashboard.getSavingsTrend(userId, months);
  }

  getCategoryBreakdown(userId: string) {
    this.logger.debug(`[getCategoryBreakdown] Computing breakdown for user ${userId.slice(0, 8)}`);
    return this.trends.getCategoryBreakdown(userId);
  }

  getHealthScore(userId: string) {
    this.logger.debug(`[getHealthScore] Computing health score for user ${userId.slice(0, 8)}`);
    return this.trends.getHealthScore(userId);
  }

  getRecommendations(userId: string) {
    this.logger.debug(
      `[getRecommendations] Generating recommendations for user ${userId.slice(0, 8)}`,
    );
    return this.trends.getRecommendations(userId);
  }

  getSafeToSpend(userId: string) {
    this.logger.debug(`[getSafeToSpend] Computing safe-to-spend for user ${userId.slice(0, 8)}`);
    return this.trends.getSafeToSpend(userId);
  }
}
