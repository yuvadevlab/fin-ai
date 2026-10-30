import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "@/common/guards/workspace.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CurrentWorkspace } from "@/common/decorators/current-workspace.decorator";
import { AnalyticsService } from "./analytics.service";
import { Logger } from "@yuva-devlab/logger";

@ApiTags("Insights")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller("insights")
export class InsightsController {
  private readonly logger = new Logger(InsightsController.name);
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("recommendations")
  @ApiOperation({ summary: "Get deterministic prioritized financial recommendations" })
  getRecommendations(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @CurrentWorkspace("memberUserIds") memberUserIds: string[] | undefined,
  ) {
    this.logger.info(
      `[getRecommendations] Generating recommendations for workspace ${workspaceId.slice(0, 8)}`,
    );
    return this.analyticsService.getRecommendations(userId, workspaceId, memberUserIds);
  }
}
