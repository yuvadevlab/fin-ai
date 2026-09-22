import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
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
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  /** Returns all category groups in display order. Auto-seeds defaults on first access. */
  async getCategoryGroups() {
    this.logger.debug(`[getCategoryGroups] Fetching all category groups`);
    const existing = await this.prisma.client.categoryGroup.findMany({
      orderBy: { order: "asc" },
    });

    if (existing.length > 0) {
      this.logger.debug(`[getCategoryGroups] Found ${existing.length} existing category group(s)`);
      return existing;
    }

    this.logger.info(
      `[getCategoryGroups] Auto-seeding ${7} default category groups (none exist yet)`,
    );
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

    const seeded = await this.prisma.client.categoryGroup.findMany({
      orderBy: { order: "asc" },
    });
    this.logger.info(`[getCategoryGroups] Seeded ${seeded.length} category groups successfully`);
    return seeded;
  }

  /**
   * Returns all categories for a user. Auto-seeds default categories on first
   * access (when the user has zero categories). The seed uses `skipDuplicates`
   * so it's safe to call repeatedly — it won't create duplicates if the user
   * already has some categories but not all defaults.
   */
  async getCategories(userId: string) {
    this.logger.debug(`[getCategories] Fetching categories for user ${userId.slice(0, 8)}`);
    let categories = await this.prisma.client.category.findMany({
      where: { userId },
      include: { categoryGroup: { select: { id: true, name: true, order: true } } },
      orderBy: { name: "asc" },
    });

    // Auto-seed default categories if user has none
    if (categories.length === 0) {
      this.logger.info(
        `[getCategories] Auto-seeding default categories for user ${userId.slice(0, 8)} (no categories exist)`,
      );
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
      this.logger.info(
        `[getCategories] Seeded ${categories.length} default categories for user ${userId.slice(0, 8)}`,
      );
    }

    this.logger.debug(
      `[getCategories] Returning ${categories.length} category(s) for user ${userId.slice(0, 8)}`,
    );
    return categories;
  }

  /**
   * Creates a custom category for the user. Category names are unique per user
   * (case-insensitive). The group can be specified by name or by groupId — if
   * groupId is given, its name is looked up. Defaults to "Variable Expenses".
   */
  async createCategory(userId: string, input: CreateCategoryInput) {
    this.logger.info(
      `[createCategory] Creating category "${input.name}" for user ${userId.slice(0, 8)}`,
    );
    const existing = await this.prisma.client.category.findFirst({
      where: {
        name: { equals: input.name, mode: "insensitive" },
        userId,
      },
    });

    if (existing) {
      this.logger.warn(
        `[createCategory] Duplicate category name "${input.name}" for user ${userId.slice(0, 8)}`,
      );
      throw new ConflictException("Category with this name already exists");
    }

    let groupName = input.group ?? "Variable Expenses";
    if (input.groupId) {
      const grp = await this.prisma.client.categoryGroup.findUnique({
        where: { id: input.groupId },
      });
      if (!grp) {
        this.logger.warn(
          `[createCategory] Category group ${input.groupId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
        );
        throw new NotFoundException("Category group not found");
      }
      groupName = grp.name;
    }

    return this.prisma.client.category
      .create({
        data: {
          userId,
          name: input.name,
          group: groupName,
          groupId: input.groupId || null,
          icon: input.icon || null,
          isDefault: false,
        },
      })
      .then((cat) => {
        this.logger.info(
          `[createCategory] Created category "${cat.name}" [${cat.group}] (id: ${cat.id.slice(0, 8)}) for user ${userId.slice(0, 8)}`,
        );
        return cat;
      });
  }

  /**
   * Updates a category's name, group, or icon. Enforces the same unique-name
   * constraint as create — the check excludes the current category so renaming
   * to its own name doesn't throw a false conflict.
   */
  async updateCategory(id: string, userId: string, input: UpdateCategoryInput) {
    this.logger.info(
      `[updateCategory] Updating category ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const category = await this.prisma.client.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      this.logger.warn(
        `[updateCategory] Category ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
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
        this.logger.warn(
          `[updateCategory] Cannot rename — category "${input.name}" already exists for user ${userId.slice(0, 8)}`,
        );
        throw new ConflictException("Category with this name already exists");
      }
    }

    let groupName = input.group;
    if (input.groupId) {
      const grp = await this.prisma.client.categoryGroup.findUnique({
        where: { id: input.groupId },
      });
      if (!grp) {
        this.logger.warn(`[updateCategory] Category group ${input.groupId.slice(0, 8)} not found`);
        throw new NotFoundException("Category group not found");
      }
      groupName = grp.name;
    }

    return this.prisma.client.category
      .update({
        where: { id },
        data: {
          ...(input.name ? { name: input.name } : {}),
          ...(groupName ? { group: groupName } : {}),
          ...(input.groupId !== undefined ? { groupId: input.groupId } : {}),
          ...(input.icon !== undefined ? { icon: input.icon } : {}),
        },
      })
      .then((cat) => {
        this.logger.info(
          `[updateCategory] Updated category ${id.slice(0, 8)} → "${cat.name}" [${cat.group}] for user ${userId.slice(0, 8)}`,
        );
        return cat;
      });
  }

  /**
   * Deletes a category only if it has no transactions or budgets referencing it.
   * This prevents orphaning transactions (which MUST have a category) or
   * breaking budget rules that point to this category.
   */
  async deleteCategory(id: string, userId: string) {
    this.logger.info(
      `[deleteCategory] Attempting to delete category ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const category = await this.prisma.client.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      this.logger.warn(
        `[deleteCategory] Category ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException("Category not found");
    }

    const transactionsCount = await this.prisma.client.transaction.count({
      where: { categoryId: id },
    });

    if (transactionsCount > 0) {
      this.logger.warn(
        `[deleteCategory] Cannot delete category ${id.slice(0, 8)} — ${transactionsCount} transaction(s) reference it (user: ${userId.slice(0, 8)})`,
      );
      throw new BadRequestException(
        "Cannot delete category because it is being used by transactions",
      );
    }

    const budgetsCount = await this.prisma.client.budget.count({
      where: { categoryId: id },
    });

    if (budgetsCount > 0) {
      this.logger.warn(
        `[deleteCategory] Cannot delete category ${id.slice(0, 8)} — ${budgetsCount} budget(s) reference it (user: ${userId.slice(0, 8)})`,
      );
      throw new BadRequestException("Cannot delete category because it is being used by budgets");
    }

    await this.prisma.client.category.delete({
      where: { id },
    });
    this.logger.info(
      `[deleteCategory] Category ${id.slice(0, 8)} ("${category.name}") deleted for user ${userId.slice(0, 8)}`,
    );
    return { deleted: true };
  }
}
