import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateInvestmentInput } from "@finai/validation";
import { calculateAssetAllocation, calculatePortfolioValue } from "@finai/finance-engine";
import { AssetClass } from "@finai/database";

/**
 * Investment portfolio service.
 *
 * Investments are holdings (stocks, mutual funds, crypto, etc.) tracked by
 * current market value. The service computes the total portfolio value and
 * asset allocation breakdown using pure helpers from finance-engine.
 */
@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Lists all investments for a user with their asset allocation percentages.
   * The allocation is computed across all investments by asset class, so the
   * user can see how their portfolio is distributed.
   */
  async findAll(userId: string) {
    this.logger.debug(`[findAll] Listing investments for user ${userId.slice(0, 8)}`);
    const investments = await this.prisma.client.investment.findMany({
      where: { userId },
      orderBy: { currentValue: "desc" },
    });

    const totalValue = calculatePortfolioValue(investments);
    const allocated = calculateAssetAllocation(investments);

    this.logger.log(
      `[findAll] Found ${investments.length} investment(s), total value: ${totalValue} (user: ${userId.slice(0, 8)})`,
    );
    return { investments: allocated, totalValue };
  }

  /** Finds a single investment by ID, scoped to the user. Throws if not found. */
  async findOne(id: string, userId: string) {
    this.logger.debug(
      `[findOne] Looking up investment ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    const investment = await this.prisma.client.investment.findFirst({
      where: { id, userId },
    });
    if (!investment) {
      this.logger.warn(
        `[findOne] Investment ${id.slice(0, 8)} not found for user ${userId.slice(0, 8)}`,
      );
      throw new NotFoundException(`Investment ${id} not found`);
    }
    return investment;
  }

  /** Creates a new investment holding for the user. */
  async create(userId: string, input: CreateInvestmentInput) {
    this.logger.info(
      `[create] Adding investment "${input.name}" [${input.assetClass}] value: ${input.currentValue} (user: ${userId.slice(0, 8)})`,
    );
    const inv = await this.prisma.client.investment.create({
      data: {
        userId,
        name: input.name,
        assetClass: input.assetClass as AssetClass,
        currentValue: input.currentValue,
        investedAmount: input.investedAmount,
      },
    });
    this.logger.log(
      `Created investment "${inv.name}" [${inv.assetClass}] value: ${inv.currentValue} for user ${userId.slice(0, 8)}`,
    );
    return inv;
  }

  /** Updates the current market value of an investment. */
  async updateValue(id: string, userId: string, currentValue: number) {
    this.logger.info(
      `[updateValue] Updating investment ${id.slice(0, 8)} to value: ${currentValue} (user: ${userId.slice(0, 8)})`,
    );
    await this.findOne(id, userId);
    const updated = await this.prisma.client.investment.update({
      where: { id },
      data: { currentValue },
    });
    this.logger.log(
      `Updated investment ${id.slice(0, 8)} currentValue: ${currentValue} (user: ${userId.slice(0, 8)})`,
    );
    return updated;
  }

  /** Deletes an investment. The investment must belong to the user (enforced by findOne). */
  async remove(id: string, userId: string) {
    this.logger.info(
      `[remove] Deleting investment ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    await this.findOne(id, userId);
    await this.prisma.client.investment.delete({ where: { id } });
    this.logger.log(`Deleted investment ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`);
    return { deleted: true };
  }
}
