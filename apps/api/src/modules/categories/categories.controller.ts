import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/modules/analytics/analytics.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import {
  createCategorySchema,
  updateCategorySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@finai/validation";
import { DEFAULT_CATEGORIES } from "./default-categories";

@ApiTags("Categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("categories")
export class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get("groups")
  @ApiOperation({ summary: "Get all global category groups" })
  async getCategoryGroups() {
    return this.prisma.client.categoryGroup.findMany({
      orderBy: { order: "asc" },
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all categories for current user" })
  async getCategories(@CurrentUser("id") userId: string) {
    let categories = await this.prisma.client.category.findMany({
      where: { userId },
      include: { categoryGroup: { select: { id: true, name: true, order: true } } },
      orderBy: { name: "asc" },
    });

    // Auto-seed default categories if user has none
    if (categories.length === 0) {
      await this.prisma.client.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          userId,
          name: cat.name,
          group: cat.group,
          icon: cat.icon,
          isDefault: true,
        })),
        skipDuplicates: true,
      });

      categories = await this.prisma.client.category.findMany({
        where: { userId },
        include: { categoryGroup: { select: { id: true, name: true, order: true } } },
        orderBy: { name: "asc" },
      });
    }

    return categories;
  }

  @Post()
  @ApiOperation({ summary: "Create a custom category" })
  async createCategory(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput,
  ) {
    const existing = await this.prisma.client.category.findFirst({
      where: {
        name: { equals: body.name, mode: "insensitive" },
        userId,
      },
    });

    if (existing) {
      throw new ConflictException("Category with this name already exists");
    }

    let groupName = body.group ?? "Variable Expenses";
    if (body.groupId) {
      const grp = await this.prisma.client.categoryGroup.findUnique({
        where: { id: body.groupId },
      });
      if (!grp) throw new NotFoundException("Category group not found");
      groupName = grp.name;
    }

    return this.prisma.client.category.create({
      data: {
        userId,
        name: body.name,
        group: groupName,
        groupId: body.groupId || null,
        icon: body.icon || null,
        isDefault: false,
      },
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a custom category" })
  async updateCategory(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryInput,
  ) {
    const category = await this.prisma.client.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (body.name) {
      const existing = await this.prisma.client.category.findFirst({
        where: {
          name: { equals: body.name, mode: "insensitive" },
          userId,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException("Category with this name already exists");
      }
    }

    let groupName = body.group;
    if (body.groupId) {
      const grp = await this.prisma.client.categoryGroup.findUnique({
        where: { id: body.groupId },
      });
      if (!grp) throw new NotFoundException("Category group not found");
      groupName = grp.name;
    }

    return this.prisma.client.category.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(groupName ? { group: groupName } : {}),
        ...(body.groupId !== undefined ? { groupId: body.groupId } : {}),
        ...(body.icon !== undefined ? { icon: body.icon } : {}),
      },
    });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a custom category" })
  async deleteCategory(@CurrentUser("id") userId: string, @Param("id") id: string) {
    const category = await this.prisma.client.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const transactionsCount = await this.prisma.client.transaction.count({
      where: { categoryId: id },
    });

    if (transactionsCount > 0) {
      throw new BadRequestException(
        "Cannot delete category because it is being used by transactions",
      );
    }

    const budgetsCount = await this.prisma.client.budget.count({
      where: { categoryId: id },
    });

    if (budgetsCount > 0) {
      throw new BadRequestException("Cannot delete category because it is being used by budgets");
    }

    await this.prisma.client.category.delete({
      where: { id },
    });

    return { deleted: true };
  }
}
