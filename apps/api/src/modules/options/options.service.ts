import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

/** Baseline options seeded into `reference_options` on first read if empty. */
const BASELINE_OPTIONS = [
  // Asset Classes
  { category: "ASSET_CLASS", label: "Mutual Fund", value: "MUTUAL_FUND", order: 1 },
  { category: "ASSET_CLASS", label: "Stock Equities", value: "STOCK", order: 2 },
  { category: "ASSET_CLASS", label: "Fixed Deposit", value: "FIXED_DEPOSIT", order: 3 },
  { category: "ASSET_CLASS", label: "Gold", value: "GOLD", order: 4 },
  { category: "ASSET_CLASS", label: "EPF Retirement Fund", value: "EPF", order: 5 },
  { category: "ASSET_CLASS", label: "PPF Savings Fund", value: "PPF", order: 6 },
  { category: "ASSET_CLASS", label: "Real Estate", value: "REAL_ESTATE", order: 7 },
  { category: "ASSET_CLASS", label: "Crypto Currency", value: "CRYPTO", order: 8 },
  { category: "ASSET_CLASS", label: "Other Asset", value: "OTHER", order: 9 },

  // Goal Types
  { category: "GOAL_TYPE", label: "Emergency Fund", value: "EMERGENCY_FUND", order: 1 },
  { category: "GOAL_TYPE", label: "Obligation", value: "OBLIGATION", order: 2 },
  { category: "GOAL_TYPE", label: "Lifestyle", value: "LIFESTYLE", order: 3 },
  { category: "GOAL_TYPE", label: "Personal", value: "PERSONAL", order: 4 },

  // Transaction Types
  { category: "TRANSACTION_TYPE", label: "Expense", value: "expense", order: 1 },
  { category: "TRANSACTION_TYPE", label: "Income", value: "income", order: 2 },
  { category: "TRANSACTION_TYPE", label: "Transfer", value: "transfer", order: 3 },
  { category: "TRANSACTION_TYPE", label: "Investment", value: "investment", order: 4 },
  { category: "TRANSACTION_TYPE", label: "Goal", value: "goal", order: 5 },
] as const;

/**
 * Provides dynamic reference options stored in the `reference_options` table.
 *
 * On first access the service auto-seeds baseline options using upsert so it
 * is safe to call repeatedly — it won't create duplicates.
 *
 * Supported categories: ASSET_CLASS, GOAL_TYPE, TRANSACTION_TYPE.
 */
@Injectable()
export class OptionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns all active reference options for a given category, ordered by `order`.
   * Auto-seeds baseline options if the `reference_options` table is empty.
   */
  async getByCategory(category: string) {
    await this.ensureSeeded();

    return this.prisma.client.referenceOption.findMany({
      where: { category, isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, category: true, label: true, value: true, order: true, isActive: true },
    });
  }

  /** Returns all active reference options grouped by category. */
  async getAll() {
    await this.ensureSeeded();

    const options = await this.prisma.client.referenceOption.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: { id: true, category: true, label: true, value: true, order: true, isActive: true },
    });

    // Group by category
    return options.reduce(
      (acc, opt) => {
        if (!acc[opt.category]) acc[opt.category] = [];
        acc[opt.category].push(opt);
        return acc;
      },
      {} as Record<string, typeof options>,
    );
  }

  /**
   * Seeds baseline options into the DB if the table is empty.
   * Uses `upsert` to avoid duplicates — safe to call on every request during cold start.
   */
  private async ensureSeeded() {
    const count = await this.prisma.client.referenceOption.count();
    if (count > 0) return;

    await Promise.all(
      BASELINE_OPTIONS.map((opt) =>
        this.prisma.client.referenceOption.upsert({
          where: { category_value: { category: opt.category, value: opt.value } },
          create: { ...opt },
          update: { label: opt.label, order: opt.order },
        }),
      ),
    );
  }
}
