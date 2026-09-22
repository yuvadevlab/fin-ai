import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class MenuItemsService {
  private readonly logger = new Logger(MenuItemsService.name);
  constructor(private prisma: PrismaService) {}

  async findAll() {
    this.logger.debug("[findAll] Fetching all menu items");
    const items = await this.prisma.client.menuItem.findMany({
      orderBy: { order: "asc" },
    });
    this.logger.log(`[findAll] Found ${items.length} menu item(s)`);
    return items;
  }
}
