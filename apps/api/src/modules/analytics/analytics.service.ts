import { Injectable } from "@nestjs/common";
import { DashboardStatsService } from "./services/dashboard-stats.service";
import { SpendingTrendsService } from "./services/spending-trends.service";

/**
 * Facade that preserves the public API for the analytics controller and any
 * agent tooling. All logic lives in DashboardStatsService / SpendingTrendsService.
 */
@Injectable()
export class AnalyticsService {
  constructor(
    private dashboard: DashboardStatsService,
    private trends: SpendingTrendsService,
  ) {}

  getDashboard(userId: string) {
    return this.dashboard.getDashboard(userId);
  }

  getMonthlyAnalytics(userId: string, months = 6) {
    return this.dashboard.getMonthlyAnalytics(userId, months);
  }

  getSavingsTrend(userId: string, months = 6) {
    return this.dashboard.getSavingsTrend(userId, months);
  }

  getCategoryBreakdown(userId: string) {
    return this.trends.getCategoryBreakdown(userId);
  }

  getHealthScore(userId: string) {
    return this.trends.getHealthScore(userId);
  }

  getRecommendations(userId: string) {
    return this.trends.getRecommendations(userId);
  }

  getSafeToSpend(userId: string) {
    return this.trends.getSafeToSpend(userId);
  }
}
