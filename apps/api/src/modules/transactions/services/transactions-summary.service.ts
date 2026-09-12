import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import type { TransactionFilterInput } from "@finai/validation";
import { TransactionsRepository } from "../repositories";

export interface TransactionSummarizeFilter {
  dateFrom: string;
  dateTo: string;
  groupBy: "category" | "type";
  type?: import("@finai/database").TransactionType;
}

export interface TransactionSummaryItem {
  key: string;
  total: number;
}

/**
 * Handles category-based operations and aggregation summaries.
 * Delegates all DB access to TransactionsRepository.
 */
@Injectable()
export class TransactionsSummaryService {
  private readonly logger = new Logger(TransactionsSummaryService.name);
  constructor(
    private prisma: PrismaService,
    private repo: TransactionsRepository,
  ) {}

  /**
   * Re-categorize transactions matching a filter. When `dryRun` is true,
   * only reports the affected count without mutating.
   */
  async recategorize(
    userId: string,
    filter: TransactionFilterInput,
    targetCategoryId: string,
    dryRun = false,
  ) {
    this.logger.debug(
      `[recategorize] Recategorizing to ${targetCategoryId.slice(0, 8)} (dryRun: ${dryRun}) for user ${userId.slice(0, 8)}`,
    );
    const targetCategory = await this.prisma.client.category.findFirst({
      where: { id: targetCategoryId, userId },
    });
    if (!targetCategory) {
      this.logger.warn(
        `[recategorize] Target category ${targetCategoryId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException("Target category not found");
    }

    const matched = await this.repo.findForRecategorize(userId, filter);
    this.logger.log(
      `[recategorize] Matched ${matched.length} transaction(s) for user ${userId.slice(0, 8)}`,
    );

    if (dryRun) {
      this.logger.debug(`[recategorize] Dry-run complete — ${matched.length} would be updated`);
      return { dryRun: true, matched: matched.length, updated: 0 };
    }
    if (matched.length === 0) {
      this.logger.debug("[recategorize] No transactions matched — nothing to update");
      return { dryRun: false, matched: 0, updated: 0 };
    }

    await this.repo.updateCategoryBulk(
      matched.map((t) => t.id),
      targetCategoryId,
    );

    this.logger.log(
      `[recategorize] Updated ${matched.length} transaction(s) to "${targetCategory.name}" for user ${userId.slice(0, 8)}`,
    );
    return { dryRun: false, matched: matched.length, updated: matched.length };
  }

  /**
   * Deterministic aggregate totals for a date range, grouped by category
   * name or transaction type. Used by reporting and the agent tool layer.
   */
  async summarize(
    userId: string,
    filter: TransactionSummarizeFilter,
  ): Promise<TransactionSummaryItem[]> {
    this.logger.debug(
      `[summarize] Summarizing by ${filter.groupBy} from ${filter.dateFrom} to ${filter.dateTo} (user: ${userId.slice(0, 8)})`,
    );
    const dateFrom = new Date(filter.dateFrom);
    const dateTo = new Date(filter.dateTo);

    if (filter.groupBy === "type") {
      const grouped = await this.repo.groupByType(userId, dateFrom, dateTo, filter.type);
      this.logger.log(
        `[summarize] Grouped by type: ${grouped.length} group(s) for user ${userId.slice(0, 8)}`,
      );
      return grouped.map((g) => ({ key: g.type, total: g._sum.amount ?? 0 }));
    }

    const grouped = await this.repo.groupByCategory(userId, dateFrom, dateTo, filter.type);
    const categoryIds = grouped.map((g) => g.categoryId).filter((id): id is string => id !== null);

    const categories = await this.prisma.client.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    this.logger.log(
      `[summarize] Grouped by category: ${grouped.length} group(s) for user ${userId.slice(0, 8)}`,
    );
    return grouped.map((g) => ({
      key: g.categoryId ? (categoryMap[g.categoryId] ?? "Unknown") : "Uncategorized",
      total: g._sum.amount ?? 0,
    }));
  }
}
