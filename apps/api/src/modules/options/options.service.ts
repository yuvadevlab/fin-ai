/**
 * @file apps/api/src/modules/options/options.service.ts
 * @description Dynamic database-backed reference options and application performance configuration service.
 * @module @finai/api/modules/options/options.service
 */

import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
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

  // Application Performance & Runtime Characteristics
  { category: "APP_CONFIG", label: "12", value: "AI_HISTORY_WINDOW", order: 1 },
  { category: "APP_CONFIG", label: "45000", value: "STREAM_TIMEOUT_MS", order: 2 },
  { category: "APP_CONFIG", label: "50", value: "MAX_CONVERSATION_LIST_LIMIT", order: 3 },
] as const;

/**
 * Provides dynamic reference options and performance parameters stored in `reference_options`.
 */
@Injectable()
export class OptionsService {
  private readonly logger = new Logger(OptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns all active reference options for a given category, ordered by `order`.
   *
   * @param category - Category grouping identifier (e.g. 'ASSET_CLASS', 'GOAL_TYPE').
   * @returns Array of active reference options.
   */
  async getByCategory(category: string) {
    this.logger.info(`[getByCategory] Fetching options for category: ${category}`);
    await this.ensureSeeded();

    const options = await this.prisma.client.referenceOption.findMany({
      where: { category, isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, category: true, label: true, value: true, order: true, isActive: true },
    });

    if (options.length === 0) {
      this.logger.warn(`[getByCategory] No active options found for: ${category}`);
    } else {
      this.logger.info(`[getByCategory] Found ${options.length} option(s) for ${category}`);
    }
    return options;
  }

  /**
   * Retrieves a dynamic configuration parameter from the DB.
   *
   * @param key - The config key under category APP_CONFIG.
   * @param fallback - Safe default string value if not found in DB.
   * @returns Value from database or fallback.
   */
  async getConfig(key: string, fallback: string): Promise<string> {
    this.logger.info(`[getConfig] Fetching config for key: ${key}`);
    await this.ensureSeeded();

    const option = await this.prisma.client.referenceOption.findUnique({
      where: { category_value: { category: "APP_CONFIG", value: key } },
    });
    return option?.label ?? fallback;
  }

  /**
   * Retrieves a numeric performance parameter from the DB.
   *
   * @param key - The config key under category APP_CONFIG.
   * @param fallback - Safe default numeric value.
   * @returns Parsed number from database or fallback.
   */
  async getNumberConfig(key: string, fallback: number): Promise<number> {
    const raw = await this.getConfig(key, String(fallback));
    const parsed = Number(raw);
    return isNaN(parsed) ? fallback : parsed;
  }

  /**
   * Returns all active reference options grouped by category.
   *
   * @returns Grouped dictionary of options by category.
   */
  async getAll() {
    this.logger.info("[getAll] Fetching all options grouped by category");
    await this.ensureSeeded();

    const options = await this.prisma.client.referenceOption.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: { id: true, category: true, label: true, value: true, order: true, isActive: true },
    });

    this.logger.info(`[getAll] Found ${options.length} active option(s)`);
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
   * Seeds baseline options and performance configs into the DB if the table is empty.
   */
  private async ensureSeeded() {
    const count = await this.prisma.client.referenceOption.count();
    if (count > 0) return;

    this.logger.info(`[ensureSeeded] Seeding ${BASELINE_OPTIONS.length} baseline options...`);
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
