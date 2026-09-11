import { Module } from "@nestjs/common";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { OptionsService } from "./options.service";
import { OptionsController } from "./options.controller";

@Module({
  imports: [PrismaModule],
  controllers: [OptionsController],
  providers: [OptionsService],
  exports: [OptionsService],
})
export class OptionsModule {}
