import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { OptionsService } from "./options.service";
import { Logger } from "@yuva-devlab/logger";

/**
 * Reference options controller — provides dynamic dropdown options that
 * are stored in the database instead of hardcoded in the frontend.
 *
 * All endpoints are authenticated and publicly readable (no workspace
 * scoping; options are system-wide).
 */
@ApiTags("options")
@UseGuards(JwtAuthGuard)
@Controller("options")
export class OptionsController {
  private readonly logger = new Logger(OptionsController.name);
  constructor(private readonly optionsService: OptionsService) {}

  @Get()
  @ApiOperation({ summary: "Get all active reference options grouped by category" })
  async getAll() {
    this.logger.debug("[GET /options] Fetching all reference options");
    const result = await this.optionsService.getAll();
    this.logger.log(`[GET /options] Returned ${Object.keys(result).length} option categorie(s)`);
    return result;
  }

  @Get(":category")
  @ApiOperation({ summary: "Get active reference options for a specific category" })
  @ApiParam({
    name: "category",
    description: "Option category (e.g. ASSET_CLASS, GOAL_TYPE, TRANSACTION_TYPE)",
    example: "ASSET_CLASS",
  })
  async getByCategory(@Param("category") category: string) {
    const normalized = category.toUpperCase();
    this.logger.debug(`[GET /options/:category] Fetching options for category: ${normalized}`);
    const result = await this.optionsService.getByCategory(normalized);
    if (result.length === 0) {
      this.logger.warn(`[GET /options/:category] No options found for category: ${normalized}`);
    } else {
      this.logger.log(
        `[GET /options/:category] Found ${result.length} option(s) for ${normalized}`,
      );
    }
    return result;
  }
}
