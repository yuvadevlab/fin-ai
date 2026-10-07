/**
 * @file apps/api/src/modules/options/options.controller.ts
 * @description Dynamic database-backed reference options and application configuration endpoints.
 * @module @finai/api/modules/options/options.controller
 */

import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { OptionsService } from "./options.service";
import { Logger } from "@yuva-devlab/logger";

/**
 * Reference options controller providing dynamic options and runtime parameters from PostgreSQL.
 */
@ApiTags("options")
@UseGuards(JwtAuthGuard)
@Controller("options")
export class OptionsController {
  private readonly logger = new Logger(OptionsController.name);

  constructor(private readonly optionsService: OptionsService) {}

  /**
   * Retrieves all reference options grouped by category.
   *
   * @returns Dictionary of options categorized by domain key.
   */
  @Get()
  @ApiOperation({ summary: "Get all active reference options grouped by category" })
  async getAll() {
    this.logger.info("[getAll] Fetching all reference options");
    const result = await this.optionsService.getAll();
    this.logger.info(`[getAll] Returned ${Object.keys(result).length} option category group(s)`);
    return result;
  }

  /**
   * Retrieves reference options for a specific domain category.
   *
   * @param category - Category key (e.g. 'ASSET_CLASS', 'GOAL_TYPE', 'APP_CONFIG').
   * @returns List of active reference options.
   */
  @Get(":category")
  @ApiOperation({ summary: "Get active reference options for a specific category" })
  @ApiParam({
    name: "category",
    description: "Option category (e.g. ASSET_CLASS, GOAL_TYPE, TRANSACTION_TYPE, APP_CONFIG)",
    example: "ASSET_CLASS",
  })
  async getByCategory(@Param("category") category: string) {
    const normalized = category.toUpperCase();
    this.logger.info(`[getByCategory] Fetching options for: ${normalized}`);
    const result = await this.optionsService.getByCategory(normalized);
    this.logger.info(`[getByCategory] Found ${result.length} option(s) for ${normalized}`);
    return result;
  }
}
