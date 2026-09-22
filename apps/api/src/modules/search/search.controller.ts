import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Logger } from "@yuva-devlab/logger";

@ApiTags("Search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("search")
export class SearchController {
  private readonly logger = new Logger(SearchController.name);
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Global search across transactions, accounts, and goals" })
  search(@CurrentUser("id") userId: string, @Query("q") q: string) {
    this.logger.debug(
      `[GET /search] Global search for user ${userId.slice(0, 8)}, query: "${(q ?? "").slice(0, 50)}"`,
    );
    return this.searchService.search(userId, q ?? "");
  }
}
