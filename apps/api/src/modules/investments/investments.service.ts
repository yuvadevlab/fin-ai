import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvestmentInput } from "@finai/validation";
import { calculateAssetAllocation, calculatePortfolioValue } from "@finai/finance-engine";
import { AssetClass } from "@finai/database";

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    const investments = await this.prisma.client.investment.findMany({
      where: { workspaceId },
      orderBy: { currentValue: "desc" },
    });

    const totalValue = calculatePortfolioValue(investments);
    const allocated = calculateAssetAllocation(investments);

    return { investments: allocated, totalValue };
  }

  async findOne(id: string, workspaceId: string) {
    const investment = await this.prisma.client.investment.findFirst({
      where: { id, workspaceId },
    });
    if (!investment) throw new NotFoundException(`Investment ${id} not found`);
    return investment;
  }

  async create(workspaceId: string, input: CreateInvestmentInput) {
    return this.prisma.client.investment.create({
      data: {
        workspaceId,
        name: input.name,
        assetClass: input.assetClass as AssetClass,
        currentValue: input.currentValue,
        investedAmount: input.investedAmount,
      },
    });
  }

  async updateValue(id: string, workspaceId: string, currentValue: number) {
    await this.findOne(id, workspaceId);
    return this.prisma.client.investment.update({
      where: { id },
      data: { currentValue },
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    await this.prisma.client.investment.delete({ where: { id } });
    return { deleted: true };
  }
}
