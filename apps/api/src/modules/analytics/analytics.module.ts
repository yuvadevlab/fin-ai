import { Module } from "@nestjs/common";
import { AnalyticsController } from "./analytics.controller";
import { InsightsController } from "./insights.controller";
import { AnalyticsService } from "./analytics.service";

@Module({
  controllers: [AnalyticsController, InsightsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
