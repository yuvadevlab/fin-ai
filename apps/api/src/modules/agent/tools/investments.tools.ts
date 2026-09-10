import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { InvestmentsService } from "@/modules/investments/investments.service";
import { createInvestmentSchema, updateInvestmentValueSchema } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";

/**
 * Read + write tools over the existing InvestmentsService. `updateValue`
 * is separated from create so the model records market fluctuations without
 * touching the invested amount (cost basis must never change on revaluation).
 */
export function createInvestmentsTools(investmentsService: InvestmentsService) {
  return [
    defineTool({
      name: "investments.list",
      description:
        "Get the user's investment portfolio with total portfolio value and per-asset allocation percentages.",
      access: "read",
      confirmation: "none",
      schema: z.object({}),
      execute: async (_input, ctx) => investmentsService.findAll(ctx.userId),
      serialize: (output) => {
        const { investments, totalValue } = output as {
          investments: {
            id: string;
            name: string;
            assetClass: string;
            currentValue: number;
            allocation: number;
          }[];
          totalValue: number;
        };
        return {
          totalValue,
          investments: investments.map((i) => ({
            id: i.id,
            name: i.name,
            assetClass: i.assetClass,
            currentValue: i.currentValue,
            allocation: i.allocation,
          })),
        };
      },
      summarize: (output) => {
        const { totalValue, investments } = output as {
          totalValue: number;
          investments: { name: string }[];
        };
        return `Portfolio value ${formatINR(totalValue)} across ${investments.length} holding(s)`;
      },
    }),
    defineTool({
      name: "investments.create",
      description:
        "Add an investment holding to the user's portfolio. Requires confirmation. Fields: name, assetClass (MUTUAL_FUND | STOCK | FIXED_DEPOSIT | GOLD | EPF | PPF | REAL_ESTATE | CRYPTO | OTHER), currentValue, investedAmount.",
      access: "write",
      confirmation: "required",
      schema: createInvestmentSchema,
      execute: async (input, ctx) => investmentsService.create(ctx.userId, input),
      serialize: (output) => {
        const investment = output as {
          id: string;
          name: string;
          assetClass: string;
          currentValue: number;
        };
        return {
          id: investment.id,
          name: investment.name,
          assetClass: investment.assetClass,
          currentValue: investment.currentValue,
        };
      },
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Add investment",
        rows: [
          ["Name", input.name],
          ["Asset class", input.assetClass],
          ["Current value", formatINR(input.currentValue)],
          ["Invested amount", formatINR(input.investedAmount)],
        ],
      }),
      summarize: (output) => {
        const investment = output as { name: string; currentValue: number };
        return `Added ${investment.name} — value ${formatINR(investment.currentValue)}`;
      },
    }),
    defineTool({
      name: "investments.updateValue",
      description:
        "Update the current market value of one of the user's investment holdings. Requires confirmation.",
      access: "write",
      confirmation: "required",
      schema: updateInvestmentValueSchema.extend({
        investmentId: z.string().uuid("Invalid investment ID"),
      }),
      execute: async (input, ctx) =>
        investmentsService.updateValue(input.investmentId, ctx.userId, input.currentValue),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Update investment value",
        rows: [
          ["Investment ID", input.investmentId],
          ["New current value", formatINR(input.currentValue)],
        ],
      }),
      summarize: (output) => {
        const investment = output as { name: string; currentValue: number };
        return `${investment.name} valued at ${formatINR(investment.currentValue)}`;
      },
    }),
    defineTool({
      name: "investments.delete",
      description:
        "Permanently remove an investment holding from the user's portfolio. Requires confirmation — this is destructive and cannot be undone.",
      access: "write",
      confirmation: "required",
      schema: z.object({
        investmentId: z.string().uuid("Invalid investment ID"),
      }),
      execute: async (input, ctx) => investmentsService.remove(input.investmentId, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Delete investment",
        rows: [
          ["Investment ID", input.investmentId],
          ["Warning", "Permanent delete — the holding is removed from the portfolio"],
        ],
      }),
      summarize: () => "Investment deleted",
    }),
  ];
}
