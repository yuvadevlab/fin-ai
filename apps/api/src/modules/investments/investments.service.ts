import { Injectable, NotFoundException } from "@nestjs/common";
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
  constructor(private prisma: PrismaService) {}

  /**
   * Lists all investments for a user with their asset allocation percentages.
   * The allocation is computed across all investments by asset class, so the
   * user can see how their portfolio is distributed.
   */
  async findAll(userId: string) {
    const investments = await this.prisma.client.investment.findMany({
      where: { userId },
      orderBy: { currentValue: "desc" },
    });

    const totalValue = calculatePortfolioValue(investments);
    const allocated = calculateAssetAllocation(investments);

    return { investments: allocated, totalValue };
  }

  /** Finds a single investment by ID, scoped to the user. Throws if not found. */
  async findOne(id: string, userId: string) {
    const investment = await this.prisma.client.investment.findFirst({
      where: { id, userId },
    });
    if (!investment) throw new NotFoundException(`Investment ${id} not found`);
    return investment;
  }

  /** Creates a new investment holding for the user. */
  async create(userId: string, input: CreateInvestmentInput) {
    return this.prisma.client.investment.create({
      data: {
        userId,
        name: input.name,
        assetClass: input.assetClass as AssetClass,
        currentValue: input.currentValue,
        investedAmount: input.investedAmount,
      },
    });
  }

  /** Updates the current market value of an investment. */
  async updateValue(id: string, userId: string, currentValue: number) {
    await this.findOne(id, userId);
    return this.prisma.client.investment.update({
      where: { id },
      data: { currentValue },
    });
  }

  /** Deletes an investment. The investment must belong to the user (enforced by findOne). */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.client.investment.delete({ where: { id } });
    return { deleted: true };
  }
}
