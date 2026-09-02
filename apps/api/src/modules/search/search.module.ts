import { Module } from "@nestjs/common";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { SearchController } from "@/modules/search/search.controller";
import { SearchService } from "@/modules/search/search.service";

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
