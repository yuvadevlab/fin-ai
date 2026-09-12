import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { MenuItemsService } from "./menu-items.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { Logger } from "@finai/logger";

@ApiTags("Menu Items")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("menu-items")
export class MenuItemsController {
  private readonly logger = new Logger(MenuItemsController.name);
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: "Get all navigation menu items with active flags" })
  findAll() {
    this.logger.debug("[GET /menu-items] Fetching all menu items");
    return this.menuItemsService.findAll();
  }
}
