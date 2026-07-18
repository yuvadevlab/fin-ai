import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PrismaService } from "../prisma/prisma.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import {
  createCategorySchema,
  updateCategorySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@finai/validation";

@ApiTags("Categories")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/categories")
export class CategoriesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Get all categories for a workspace" })
  async getCategories(@Param("workspaceId") workspaceId: string) {
    return this.prisma.client.category.findMany({
      where: {
        OR: [{ workspaceId }, { workspaceId: null }],
      },
      orderBy: { name: "asc" },
    });
  }

  @Post()
  @ApiOperation({ summary: "Create a custom category" })
  async createCategory(
    @Param("workspaceId") workspaceId: string,
    @Body(new ZodValidationPipe(createCategorySchema)) body: CreateCategoryInput,
  ) {
    // Check if category name already exists in this workspace or is a system category
    const existing = await this.prisma.client.category.findFirst({
      where: {
        name: {
          equals: body.name,
          mode: "insensitive",
        },
        OR: [{ workspaceId }, { workspaceId: null }],
      },
    });

    if (existing) {
      throw new ConflictException("Category with this name already exists");
    }

    return this.prisma.client.category.create({
      data: {
        workspaceId,
        name: body.name,
        group: body.group,
        icon: body.icon || null,
        isSystem: false,
      },
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a custom category" })
  async updateCategory(
    @Param("workspaceId") workspaceId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateCategorySchema)) body: UpdateCategoryInput,
  ) {
    const category = await this.prisma.client.category.findUnique({
      where: { id },
    });

    if (!category || category.workspaceId !== workspaceId) {
      throw new NotFoundException("Category not found");
    }

    if (category.isSystem) {
      throw new ForbiddenException("System categories cannot be modified");
    }

    if (body.name) {
      const existing = await this.prisma.client.category.findFirst({
        where: {
          name: {
            equals: body.name,
            mode: "insensitive",
          },
          OR: [{ workspaceId }, { workspaceId: null }],
          NOT: {
            id,
          },
        },
      });

      if (existing) {
        throw new ConflictException("Category with this name already exists");
      }
    }

    return this.prisma.client.category.update({
      where: { id },
      data: {
        name: body.name,
        group: body.group,
        icon: body.icon,
      },
    });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a custom category" })
  async deleteCategory(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    const category = await this.prisma.client.category.findUnique({
      where: { id },
    });

    if (!category || category.workspaceId !== workspaceId) {
      throw new NotFoundException("Category not found");
    }

    if (category.isSystem) {
      throw new ForbiddenException("System categories cannot be deleted");
    }

    // Check if category is used in any transactions or budgets
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
