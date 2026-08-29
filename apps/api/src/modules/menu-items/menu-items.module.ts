import { Module } from "@nestjs/common";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { MenuItemsController } from "@/modules/menu-items/menu-items.controller";
import { MenuItemsService } from "@/modules/menu-items/menu-items.service";

@Module({
  imports: [PrismaModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
})
export class MenuItemsModule {}
