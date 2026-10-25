import { Module } from "@nestjs/common";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./services/notifications.service";
import { NotificationsRepository } from "./repositories/notifications.repository";

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
