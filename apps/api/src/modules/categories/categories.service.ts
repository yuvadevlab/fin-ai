import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { type CreateCategoryInput, type UpdateCategoryInput } from "@finai/validation";
import { CategorySeedService } from "./category-seed.service";

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly seedService: CategorySeedService,
  ) {}

  /** Returns all category groups in display order. Auto-seeds defaults on first access. */
  async getCategoryGroups() {
    this.logger.info(`[getCategoryGroups] Fetching all category groups`);
    const existing = await this.prisma.client.categoryGroup.findMany({
      orderBy: { order: "asc" },
    });

    if (existing.length > 0) {
      this.logger.info(`[getCategoryGroups] Found ${existing.length} existing category group(s)`);
      return existing;
    }

    return this.seedService.seedCategoryGroupsIfEmpty();
  }

  /**
   * Returns all categories for a user. Auto-seeds default categories on first
   * access (when the user has zero categories).
   */
  async getCategories(userId: string) {
    this.logger.info(`[getCategories] Fetching categories for user ${userId.slice(0, 8)}`);
    let categories = await this.prisma.client.category.findMany({
      where: { userId },
      include: { categoryGroup: { select: { id: true, name: true, order: true } } },
      orderBy: { name: "asc" },
    });

    // Auto-seed default categories if user has none
    if (categories.length === 0) {
      await this.seedService.seedUserDefaultCategories(userId);
      categories = await this.prisma.client.category.findMany({
        where: { userId },
        include: { categoryGroup: { select: { id: true, name: true, order: true } } },
        orderBy: { name: "asc" },
      });
      this.logger.info(
        `[getCategories] Seeded ${categories.length} default categories for user ${userId.slice(0, 8)}`,
      );
    }

    this.logger.info(
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
      where: { name: { equals: input.name, mode: "insensitive" }, userId },
    });
    if (existing) {
      this.logger.warn(
        `[createCategory] Duplicate category name "${input.name}" for user ${userId.slice(0, 8)}`,
      );
      throw new ConflictException("Category with this name already exists");
    }

    const groupName = input.groupId
      ? await this.resolveGroupName(input.groupId)
      : (input.group ?? "Variable Expenses");

    const cat = await this.prisma.client.category.create({
      data: {
        userId,
        name: input.name,
        group: groupName,
        groupId: input.groupId || null,
        icon: input.icon || null,
        isDefault: false,
      },
    });
    this.logger.info(
      `[createCategory] Created category "${cat.name}" [${cat.group}] (id: ${cat.id.slice(0, 8)})`,
    );
    return cat;
  }

  async updateCategory(id: string, userId: string, input: UpdateCategoryInput) {
    this.logger.info(
      `[updateCategory] Updating category ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const category = await this.prisma.client.category.findFirst({ where: { id, userId } });
    if (!category) {
      this.logger.warn(
        `[updateCategory] Category ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException("Category not found");
    }

    if (input.name) {
      const existing = await this.prisma.client.category.findFirst({
        where: { name: { equals: input.name, mode: "insensitive" }, userId, NOT: { id } },
      });
      if (existing) {
        this.logger.warn(
          `[updateCategory] Duplicate category name "${input.name}" for user ${userId.slice(0, 8)}`,
        );
        throw new ConflictException("Category with this name already exists");
      }
    }

    const groupName = input.groupId ? await this.resolveGroupName(input.groupId) : input.group;

    const updated = await this.prisma.client.category.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(groupName ? { group: groupName } : {}),
        ...(input.groupId !== undefined ? { groupId: input.groupId } : {}),
        ...(input.icon !== undefined ? { icon: input.icon } : {}),
      },
    });
    this.logger.info(`[updateCategory] Updated category ${id.slice(0, 8)} → "${updated.name}"`);
    return updated;
  }

  private async resolveGroupName(groupId: string): Promise<string> {
    const grp = await this.prisma.client.categoryGroup.findUnique({ where: { id: groupId } });
    if (!grp) {
      this.logger.warn(`[resolveGroupName] Category group ${groupId.slice(0, 8)} not found`);
      throw new NotFoundException("Category group not found");
    }
    return grp.name;
  }

  /**
   * Deletes a category only if it has no transactions or budgets referencing it.
   * This prevents orphaning transactions (which MUST have a category) or
   * breaking budget rules that point to this category.
   */
  async deleteCategory(id: string, userId: string) {
    this.logger.info(
      `[deleteCategory] Deleting category ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const category = await this.prisma.client.category.findFirst({ where: { id, userId } });
    if (!category) {
      this.logger.warn(
        `[deleteCategory] Category ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException("Category not found");
    }

    const [txCount, bgCount] = await Promise.all([
      this.prisma.client.transaction.count({ where: { categoryId: id } }),
      this.prisma.client.budget.count({ where: { categoryId: id } }),
    ]);

    if (txCount > 0) {
      this.logger.warn(
        `[deleteCategory] Cannot delete ${id.slice(0, 8)}: referenced by ${txCount} transaction(s)`,
      );
      throw new BadRequestException(
        "Cannot delete category because it is being used by transactions",
      );
    }
    if (bgCount > 0) {
      this.logger.warn(
        `[deleteCategory] Cannot delete ${id.slice(0, 8)}: referenced by ${bgCount} budget(s)`,
      );
      throw new BadRequestException("Cannot delete category because it is being used by budgets");
    }

    await this.prisma.client.category.delete({ where: { id } });
    this.logger.info(
      `[deleteCategory] Category "${category.name}" deleted for user ${userId.slice(0, 8)}`,
    );
    return { deleted: true };
  }
}
