/**
 * @file apps/api/src/modules/categories/category-seed.service.ts
 * @description Auto-seeding helper routines for default category groups and categories.
 * @module @finai/api/modules/categories/category-seed.service
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { DEFAULT_CATEGORIES } from "./default-categories";

const DEFAULT_CATEGORY_GROUPS = [
  { name: "Income", order: 1 },
  { name: "Fixed Expenses", order: 2 },
  { name: "Variable Expenses", order: 3 },
  { name: "Discretionary", order: 4 },
  { name: "Savings & Investments", order: 5 },
  { name: "Debt & Repayment", order: 6 },
  { name: "Transfer", order: 7 },
];

/**
 * Service dedicated to initial seeding of system-default category groups and user categories.
 */
@Injectable()
export class CategorySeedService {
  private readonly logger = new Logger(CategorySeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seeds global default category groups if none are present in database.
   */
  async seedCategoryGroupsIfEmpty() {
    this.logger.info("[seedCategoryGroupsIfEmpty] Auto-seeding default category groups");
    await Promise.all(
      DEFAULT_CATEGORY_GROUPS.map((d) =>
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
    this.logger.info(`[seedCategoryGroupsIfEmpty] Seeded ${seeded.length} category groups`);
    return seeded;
  }

  /**
   * Seeds user-scoped default categories on first access when zero exist.
   *
   * @param userId - Unique user identifier.
   */
  async seedUserDefaultCategories(userId: string) {
    this.logger.info(
      `[seedUserDefaultCategories] Seeding default categories for user ${userId.slice(0, 8)}`,
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
  }
}
