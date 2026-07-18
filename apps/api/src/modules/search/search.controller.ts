import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Search")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "Global search across transactions, accounts, and goals" })
  search(@Param("workspaceId") workspaceId: string, @Query("q") q: string) {
    return this.searchService.search(workspaceId, q ?? "");
  }
}
