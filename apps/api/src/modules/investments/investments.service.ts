import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateInvestmentInput } from "@finai/validation";
import { calculateAssetAllocation, calculatePortfolioValue } from "@finai/finance-engine";
import { AssetClass } from "@finai/database";

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const investments = await this.prisma.client.investment.findMany({
      where: { userId },
      orderBy: { currentValue: "desc" },
    });

    const totalValue = calculatePortfolioValue(investments);
    const allocated = calculateAssetAllocation(investments);

    return { investments: allocated, totalValue };
  }

  async findOne(id: string, userId: string) {
    const investment = await this.prisma.client.investment.findFirst({
      where: { id, userId },
    });
    if (!investment) throw new NotFoundException(`Investment ${id} not found`);
    return investment;
  }

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

  async updateValue(id: string, userId: string, currentValue: number) {
    await this.findOne(id, userId);
    return this.prisma.client.investment.update({
      where: { id },
      data: { currentValue },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.client.investment.delete({ where: { id } });
    return { deleted: true };
  }
}
