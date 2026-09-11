import type { QueryClient } from "@tanstack/react-query";

/**
 * Maps agent tool-name prefixes to the React Query cache keys that must be
 * invalidated after a confirmed agent action executes. Keys mirror the
 * feature query keys used across `apps/web` (["accounts"], ["analytics"], …).
 */
const AGENT_TOOL_INVALIDATION: readonly {
  prefix: string;
  queryKeys: readonly unknown[][];
}[] = [
  { prefix: "accounts.", queryKeys: [["accounts"], ["analytics"]] },
  {
    prefix: "transactions.",
    queryKeys: [["transactions"], ["accounts"], ["analytics"], ["budgets"]],
  },
  { prefix: "categories.", queryKeys: [["categories"], ["transactions"], ["budgets"]] },
  { prefix: "budgets.", queryKeys: [["budgets"], ["analytics"]] },
  { prefix: "goals.", queryKeys: [["goals"], ["accounts"], ["analytics"]] },
  { prefix: "investments.", queryKeys: [["investments"], ["analytics"]] },
  { prefix: "profile.", queryKeys: [["user-profile"], ["accounts"]] },
];

/** Cache keys to invalidate after a confirmed action for the given tool. */
export function getAgentInvalidationKeys(tool: string): readonly unknown[][] {
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
