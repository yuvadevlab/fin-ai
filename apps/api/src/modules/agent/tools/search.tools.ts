import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { SearchService } from "@/modules/search/search.service";
import { AgentToolName, ToolAccessLevel, ToolConfirmationType } from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS } from "@finai/ai-engine";

/**
 * Cross-entity search — also the entity resolver behind vague references:
 * when the user says "my HDFC account" or "the electricity bill", the model
 * calls this first and uses the returned IDs in subsequent tool inputs.
 */
export function createSearchTools(searchService: SearchService) {
  return [
    defineTool({
      name: AgentToolName.SEARCH_EVERYTHING,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.SEARCH_EVERYTHING],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.SEARCH_EVERYTHING],
      schema: z.object({
        query: z.string().min(2, "Query must be at least 2 characters").max(100),
      }),
      execute: async (input, ctx) => searchService.search(ctx.userId, input.query),
      summarize: (output) => {
        const results = output as {
          transactions: unknown[];
          accounts: unknown[];
          goals: unknown[];
        };
        return `Found ${results.transactions.length} transaction(s), ${results.accounts.length} account(s), ${results.goals.length} goal(s)`;
      },
    }),
  ];
}
