import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { CategorySeedService } from "./category-seed.service";

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategorySeedService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
