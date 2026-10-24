import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { InvestmentsService } from "@/modules/investments/investments.service";
import { createInvestmentSchema, updateInvestmentValueSchema } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";
import {
  AgentCardType,
  AgentToolName,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@finai/ai-engine";

const INVALIDATES_INVESTMENT_WRITES = [
  ToolInvalidationTag.INVESTMENTS,
  ToolInvalidationTag.ANALYTICS,
];

/**
 * Read + write tools over the existing InvestmentsService. `updateValue`
 * is separated from create so the model records market fluctuations without
 * touching the invested amount (cost basis must never change on revaluation).
 */
export function createInvestmentsTools(investmentsService: InvestmentsService) {
  return [
    defineTool({
      name: AgentToolName.INVESTMENTS_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.INVESTMENTS_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.INVESTMENTS_LIST],
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
      name: AgentToolName.INVESTMENTS_CREATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.INVESTMENTS_CREATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.INVESTMENTS_CREATE],
      invalidates: INVALIDATES_INVESTMENT_WRITES,
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
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.INVESTMENTS_CREATE],
        rows: [
          [ConfirmationRowLabel.NAME, input.name],
          [ConfirmationRowLabel.ASSET_CLASS, input.assetClass],
          [ConfirmationRowLabel.CURRENT_VALUE, formatINR(input.currentValue)],
          [ConfirmationRowLabel.INVESTED_AMOUNT, formatINR(input.investedAmount)],
        ],
      }),
      summarize: (output) => {
        const investment = output as { name: string; currentValue: number };
        return `Added ${investment.name} — value ${formatINR(investment.currentValue)}`;
      },
    }),
    defineTool({
      name: AgentToolName.INVESTMENTS_UPDATE_VALUE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.INVESTMENTS_UPDATE_VALUE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.INVESTMENTS_UPDATE_VALUE],
      invalidates: INVALIDATES_INVESTMENT_WRITES,
      schema: updateInvestmentValueSchema.extend({
        investmentId: z.string().uuid("Invalid investment ID"),
      }),
      execute: async (input, ctx) =>
        investmentsService.updateValue(input.investmentId, ctx.userId, input.currentValue),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.INVESTMENTS_UPDATE_VALUE],
        rows: [
          [ConfirmationRowLabel.INVESTMENT_ID, input.investmentId],
          [ConfirmationRowLabel.NEW_CURRENT_VALUE, formatINR(input.currentValue)],
        ],
      }),
      summarize: (output) => {
        const investment = output as { name: string; currentValue: number };
        return `${investment.name} valued at ${formatINR(investment.currentValue)}`;
      },
    }),
    defineTool({
      name: AgentToolName.INVESTMENTS_DELETE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.INVESTMENTS_DELETE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.INVESTMENTS_DELETE],
      invalidates: INVALIDATES_INVESTMENT_WRITES,
      schema: z.object({
        investmentId: z.string().uuid("Invalid investment ID"),
      }),
      execute: async (input, ctx) => investmentsService.remove(input.investmentId, ctx.userId),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.INVESTMENTS_DELETE],
        rows: [
          [ConfirmationRowLabel.INVESTMENT_ID, input.investmentId],
          [
            ConfirmationRowLabel.WARNING,
            "Permanent delete — the holding is removed from the portfolio",
          ],
        ],
      }),
      summarize: () => "Investment deleted",
    }),
  ];
}
