import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { OptionsService } from "./options.service";

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
  constructor(private readonly optionsService: OptionsService) {}

  @Get()
  @ApiOperation({ summary: "Get all active reference options grouped by category" })
  async getAll() {
    return this.optionsService.getAll();
  }

  @Get(":category")
  @ApiOperation({ summary: "Get active reference options for a specific category" })
  @ApiParam({
    name: "category",
    description: "Option category (e.g. ASSET_CLASS, GOAL_TYPE, TRANSACTION_TYPE)",
    example: "ASSET_CLASS",
  })
  async getByCategory(@Param("category") category: string) {
    return this.optionsService.getByCategory(category.toUpperCase());
  }
}
