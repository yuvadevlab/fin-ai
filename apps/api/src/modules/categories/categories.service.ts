import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { type CreateCategoryInput, type UpdateCategoryInput } from "@finai/validation";
import { DEFAULT_CATEGORIES } from "./default-categories";

/**
 * Category management service.
 *
 * Categories are the primary way transactions are classified. Every transaction
 * MUST have a category (the DB column is NOT NULL — there is no "uncategorized"
 * state). On first access, the service auto-seeds a set of default categories so
 * the user always has something to work with.
 */
@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /** Returns all category groups in display order. Auto-seeds defaults on first access. */
  async getCategoryGroups() {
    const existing = await this.prisma.client.categoryGroup.findMany({
      orderBy: { order: "asc" },
    });

    if (existing.length > 0) return existing;

    // Auto-seed default category groups if none exist
    const defaults = [
      { name: "Income", order: 1 },
      { name: "Fixed Expenses", order: 2 },
      { name: "Variable Expenses", order: 3 },
      { name: "Discretionary", order: 4 },
      { name: "Savings & Investments", order: 5 },
      { name: "Debt & Repayment", order: 6 },
      { name: "Transfer", order: 7 },
    ];

    await Promise.all(
      defaults.map((d) =>
        this.prisma.client.categoryGroup.upsert({
          where: { name: d.name },
          create: d,
          update: { order: d.order },
        }),
      ),
    );

    return this.prisma.client.categoryGroup.findMany({
      orderBy: { order: "asc" },
    });
  }

  /**
   * Returns all categories for a user. Auto-seeds default categories on first
   * access (when the user has zero categories). The seed uses `skipDuplicates`
   * so it's safe to call repeatedly — it won't create duplicates if the user
   * already has some categories but not all defaults.
   */
  async getCategories(userId: string) {
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

  /**
   * Creates a custom category for the user. Category names are unique per user
   * (case-insensitive). The group can be specified by name or by groupId — if
   * groupId is given, its name is looked up. Defaults to "Variable Expenses".
   */
  async createCategory(userId: string, input: CreateCategoryInput) {
    const existing = await this.prisma.client.category.findFirst({
      where: {
        name: { equals: input.name, mode: "insensitive" },
        userId,
      },
    });

    if (existing) {
      throw new ConflictException("Category with this name already exists");
    }

    let groupName = input.group ?? "Variable Expenses";
    if (input.groupId) {
      const grp = await this.prisma.client.categoryGroup.findUnique({
        where: { id: input.groupId },
      });
      if (!grp) throw new NotFoundException("Category group not found");
      groupName = grp.name;
    }

    return this.prisma.client.category.create({
      data: {
        userId,
        name: input.name,
        group: groupName,
        groupId: input.groupId || null,
        icon: input.icon || null,
        isDefault: false,
      },
    });
  }

  /**
   * Updates a category's name, group, or icon. Enforces the same unique-name
   * constraint as create — the check excludes the current category so renaming
   * to its own name doesn't throw a false conflict.
   */
  async updateCategory(id: string, userId: string, input: UpdateCategoryInput) {
    const category = await this.prisma.client.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (input.name) {
      const existing = await this.prisma.client.category.findFirst({
        where: {
          name: { equals: input.name, mode: "insensitive" },
          userId,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException("Category with this name already exists");
      }
    }

    let groupName = input.group;
    if (input.groupId) {
      const grp = await this.prisma.client.categoryGroup.findUnique({
        where: { id: input.groupId },
      });
      if (!grp) throw new NotFoundException("Category group not found");
      groupName = grp.name;
    }

    return this.prisma.client.category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(groupName ? { group: groupName } : {}),
        ...(input.groupId !== undefined ? { groupId: input.groupId } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
      },
    });
  }

  /**
   * Deletes a category only if it has no transactions or budgets referencing it.
   * This prevents orphaning transactions (which MUST have a category) or
   * breaking budget rules that point to this category.
   */
  async deleteCategory(id: string, userId: string) {
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
