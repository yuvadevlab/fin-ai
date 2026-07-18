import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { MenuItemsService } from "./menu-items.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("Menu Items")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("menu-items")
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Get()
  @ApiOperation({ summary: "Get all navigation menu items with active flags" })
  findAll() {
    return this.menuItemsService.findAll();
  }
}
