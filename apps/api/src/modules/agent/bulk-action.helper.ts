import { BadRequestException } from "@nestjs/common";
import { AgentActionStatus, Prisma } from "@finai/database";
import type { PrismaService } from "@/modules/prisma/prisma.service";
import type { ToolRegistry } from "./tool-registry";
import type { AuditService } from "./audit.service";
import type { AgentContext } from "./agent.types";

export interface BulkActionState {
  executedIndices: number[];
  cancelledIndices: number[];
  created?: unknown[];
}

function parseState(result: unknown): BulkActionState {
  const r = (result as Record<string, unknown>) || {};
  return {
    executedIndices: Array.isArray(r.executedIndices) ? (r.executedIndices as number[]) : [],
    cancelledIndices: Array.isArray(r.cancelledIndices) ? (r.cancelledIndices as number[]) : [],
    created: Array.isArray(r.created) ? (r.created as unknown[]) : [],
  };
}

export async function executeBulkConfirm(
  prisma: PrismaService,
  registry: ToolRegistry,
  auditService: AuditService,
  action: {
    id: string;
    tool: string;
    input: unknown;
    conversationId: string;
    result?: unknown;
  },
  userId: string,
  itemIndex?: number,
) {
  const transactions = ((action.input as { transactions?: unknown[] })?.transactions ||
    []) as Record<string, unknown>[];
  const state = parseState(action.result);
  const tool = registry.get(action.tool);
  if (!tool) throw new BadRequestException(`Unknown tool: ${action.tool}`);

  const ctx: AgentContext = { userId, conversationId: action.conversationId, runId: action.id };

  if (itemIndex !== undefined) {
    if (itemIndex < 0 || itemIndex >= transactions.length) {
      throw new BadRequestException(`Invalid transaction item index: ${itemIndex}`);
    }
    if (state.executedIndices.includes(itemIndex)) {
      return { alreadyExecuted: true as const, itemIndex };
    }
    if (state.cancelledIndices.includes(itemIndex)) {
      throw new BadRequestException(
        `Transaction item #${itemIndex + 1} has already been cancelled`,
      );
    }

    const item = transactions[itemIndex];
    const output = await tool.execute({ transactions: [item] }, ctx);

    const nextExecuted = [...state.executedIndices, itemIndex];
    const allDone = transactions.every(
      (_, i) => nextExecuted.includes(i) || state.cancelledIndices.includes(i),
    );
    const nextCreated = [...(state.created || []), ...(Array.isArray(output) ? output : [output])];

    const updated = await prisma.client.agentAction.update({
      where: { id: action.id },
      data: {
        status: allDone ? AgentActionStatus.EXECUTED : AgentActionStatus.PROPOSED,
        executedAt: allDone ? new Date() : null,
        result: {
          executedIndices: nextExecuted,
          cancelledIndices: state.cancelledIndices,
          created: nextCreated as Prisma.InputJsonValue,
        },
      },
    });

    await auditService.record({
      userId,
      runId: action.id,
      action: "action.confirm_item",
      tool: action.tool,
      status: "success",
      after: output,
      metadata: { itemIndex },
    });

    return {
      alreadyExecuted: false as const,
      itemIndex,
      allCompleted: allDone,
      action: updated,
      result: output,
    };
  }

  // Confirm All remaining (non-executed and non-cancelled)
  const remaining = transactions
    .map((tx, idx) => ({ tx, idx }))
    .filter(
      ({ idx }) => !state.executedIndices.includes(idx) && !state.cancelledIndices.includes(idx),
    );

  if (remaining.length === 0) {
    return { alreadyExecuted: true as const, allCompleted: true };
  }

  const output = await tool.execute({ transactions: remaining.map((r) => r.tx) }, ctx);
  const nextExecuted = [...state.executedIndices, ...remaining.map((r) => r.idx)];
  const nextCreated = [...(state.created || []), ...(Array.isArray(output) ? output : [output])];

  const updated = await prisma.client.agentAction.update({
    where: { id: action.id },
    data: {
      status: AgentActionStatus.EXECUTED,
      executedAt: new Date(),
      result: {
        executedIndices: nextExecuted,
        cancelledIndices: state.cancelledIndices,
        created: nextCreated as Prisma.InputJsonValue,
      },
    },
  });

  await auditService.record({
    userId,
    runId: action.id,
    action: "action.confirm",
    tool: action.tool,
    status: "success",
    after: output,
    metadata: { count: remaining.length },
  });

  return {
    alreadyExecuted: false as const,
    allCompleted: true,
    count: remaining.length,
    action: updated,
    result: output,
  };
}

export async function executeBulkReject(
  prisma: PrismaService,
  auditService: AuditService,
  action: {
    id: string;
    tool: string;
    input: unknown;
    result?: unknown;
  },
  userId: string,
  itemIndex?: number,
) {
  const transactions = ((action.input as { transactions?: unknown[] })?.transactions ||
    []) as Record<string, unknown>[];
  const state = parseState(action.result);

  if (itemIndex !== undefined) {
    if (itemIndex < 0 || itemIndex >= transactions.length) {
      throw new BadRequestException(`Invalid transaction item index: ${itemIndex}`);
    }
    if (state.executedIndices.includes(itemIndex)) {
      throw new BadRequestException(
        `Transaction item #${itemIndex + 1} was already recorded and cannot be cancelled`,
      );
    }
    if (state.cancelledIndices.includes(itemIndex)) {
      return { rejected: true as const, itemIndex };
    }

    const nextCancelled = [...state.cancelledIndices, itemIndex];
    const allDone = transactions.every(
      (_, i) => state.executedIndices.includes(i) || nextCancelled.includes(i),
    );
    const finalStatus = allDone
      ? state.executedIndices.length > 0
        ? AgentActionStatus.EXECUTED
        : AgentActionStatus.REJECTED
      : AgentActionStatus.PROPOSED;

    const updated = await prisma.client.agentAction.update({
      where: { id: action.id },
      data: {
        status: finalStatus,
        result: {
          executedIndices: state.executedIndices,
          cancelledIndices: nextCancelled,
          created: (state.created || []) as Prisma.InputJsonValue,
        },
      },
    });

    await auditService.record({
      userId,
      runId: action.id,
      action: "action.reject_item",
      tool: action.tool,
      status: "rejected",
      metadata: { itemIndex },
    });

    return { rejected: true as const, itemIndex, allCompleted: allDone, action: updated };
  }

  // Cancel all remaining items
  const nextCancelled = Array.from(
    new Set([
      ...state.cancelledIndices,
      ...transactions.map((_, idx) => idx).filter((i) => !state.executedIndices.includes(i)),
    ]),
  );
  const finalStatus =
    state.executedIndices.length > 0 ? AgentActionStatus.EXECUTED : AgentActionStatus.REJECTED;

  const updated = await prisma.client.agentAction.update({
    where: { id: action.id },
    data: {
      status: finalStatus,
      result: {
        executedIndices: state.executedIndices,
        cancelledIndices: nextCancelled,
        created: (state.created || []) as Prisma.InputJsonValue,
      },
    },
  });

  await auditService.record({
    userId,
    runId: action.id,
    action: "action.reject",
    tool: action.tool,
    status: "rejected",
  });

  return { rejected: true as const, allCompleted: true, action: updated };
}
