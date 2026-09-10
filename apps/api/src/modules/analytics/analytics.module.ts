import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { InsightsController } from "./insights.controller";
import { AnalyticsService } from "./analytics.service";
import { AnalyticsRepository } from "./repositories";
import { DashboardStatsService, SpendingTrendsService } from "./services";

@Module({
  controllers: [AnalyticsController, InsightsController],
  providers: [AnalyticsRepository, DashboardStatsService, SpendingTrendsService, AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
