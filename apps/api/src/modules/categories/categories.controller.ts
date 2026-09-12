import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CategoriesService } from "./categories.service";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { Logger } from "@finai/logger";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "@finai/validation";

@ApiTags("Categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("categories")
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get("groups")
  @ApiOperation({ summary: "Get all global category groups" })
  getCategoryGroups() {
    this.logger.debug("[GET /categories/groups] Fetching global category groups");
    return this.categoriesService.getCategoryGroups();
  }

  @Get()
  @ApiOperation({ summary: "Get all categories for current user" })
  getCategories(@CurrentUser("id") userId: string) {
    this.logger.debug(`[GET /categories] Listing categories for user ${userId.slice(0, 8)}`);
    return this.categoriesService.getCategories(userId);
  }

  @Post()
  @ApiOperation({ summary: "Create a custom category" })
  createCategory(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput,
  ) {
    this.logger.info(
      `[POST /categories] Creating category "${body.name}" for user ${userId.slice(0, 8)}`,
    );
    return this.categoriesService.createCategory(userId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a custom category" })
  updateCategory(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryInput,
  ) {
    this.logger.info(
      `[PATCH /categories/:id] Updating category ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.categoriesService.updateCategory(id, userId, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a custom category" })
  deleteCategory(@CurrentUser("id") userId: string, @Param("id") id: string) {
    this.logger.info(
      `[DELETE /categories/:id] Deleting category ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.categoriesService.deleteCategory(id, userId);
  }
}
