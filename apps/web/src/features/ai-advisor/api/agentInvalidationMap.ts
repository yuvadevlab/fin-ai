import type { QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, ToolInvalidationTag } from "@finai/shared-types";

/**
 * Maps agent tool-name prefixes to the React Query cache keys that must be
 * invalidated after a confirmed agent action executes.
 */
const AGENT_TOOL_INVALIDATION: readonly {
  prefix: string;
  queryKeys: readonly (readonly unknown[])[];
}[] = [
  {
    prefix: `${ToolInvalidationTag.ACCOUNTS}.`,
    queryKeys: [QUERY_KEYS.ACCOUNTS.ALL, QUERY_KEYS.ANALYTICS.DASHBOARD],
  },
  {
    prefix: `${ToolInvalidationTag.TRANSACTIONS}.`,
    queryKeys: [
      QUERY_KEYS.TRANSACTIONS.ALL,
      QUERY_KEYS.ACCOUNTS.ALL,
      QUERY_KEYS.ANALYTICS.DASHBOARD,
      QUERY_KEYS.BUDGETS.ALL,
    ],
  },
  {
    prefix: `${ToolInvalidationTag.CATEGORIES}.`,
    queryKeys: [QUERY_KEYS.CATEGORIES.ALL, QUERY_KEYS.TRANSACTIONS.ALL, QUERY_KEYS.BUDGETS.ALL],
  },
  {
    prefix: `${ToolInvalidationTag.BUDGETS}.`,
    queryKeys: [QUERY_KEYS.BUDGETS.ALL, QUERY_KEYS.ANALYTICS.DASHBOARD],
  },
  {
    prefix: `${ToolInvalidationTag.GOALS}.`,
    queryKeys: [QUERY_KEYS.GOALS.ALL, QUERY_KEYS.ACCOUNTS.ALL, QUERY_KEYS.ANALYTICS.DASHBOARD],
  },
  {
    prefix: `${ToolInvalidationTag.INVESTMENTS}.`,
    queryKeys: [QUERY_KEYS.INVESTMENTS.PORTFOLIO, QUERY_KEYS.ANALYTICS.DASHBOARD],
  },
  {
    prefix: `${ToolInvalidationTag.PROFILE}.`,
    queryKeys: [QUERY_KEYS.USER.PROFILE, QUERY_KEYS.ACCOUNTS.ALL],
  },
];

/** Cache keys to invalidate after a confirmed action for the given tool. */
export function getAgentInvalidationKeys(tool: string): readonly (readonly unknown[])[] {
  return AGENT_TOOL_INVALIDATION.filter((entry) => tool.startsWith(entry.prefix)).flatMap(
    (entry) => entry.queryKeys,
  );
}

/** Invalidate every query key affected by an executed agent tool. */
export function invalidateForAgentTool(queryClient: QueryClient, tool: string): void {
  for (const queryKey of getAgentInvalidationKeys(tool)) {
    void queryClient.invalidateQueries({ queryKey });
  }
}
