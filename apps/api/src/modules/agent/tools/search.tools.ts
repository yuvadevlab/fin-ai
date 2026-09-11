import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { SearchService } from "@/modules/search/search.service";

/**
 * Cross-entity search — also the entity resolver behind vague references:
 * when the user says "my HDFC account" or "the electricity bill", the model
 * calls this first and uses the returned IDs in subsequent tool inputs.
 */
export function createSearchTools(searchService: SearchService) {
  return [
    defineTool({
      name: "search.everything",
      description:
        "Search the user's transactions (by notes, category, or account name), accounts, and goals for a text query. Use this to resolve vague references like 'my HDFC account' or 'the electricity bill'.",
      access: "read",
      confirmation: "none",
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
