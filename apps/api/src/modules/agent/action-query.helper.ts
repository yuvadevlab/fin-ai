import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AgentActionStatus } from "@finai/database";
import type { PrismaService } from "@/modules/prisma/prisma.service";
import type { Logger } from "@yuva-devlab/logger";
import type { AgentCard } from "@finai/ai-engine";
import type { AuditService } from "./audit.service";
import { executeBulkReject } from "./bulk-action.helper";

export async function rejectAgentAction(
  prisma: PrismaService,
  auditService: AuditService,
  logger: Logger,
  actionId: string,
  userId: string,
  options?: { itemIndex?: number },
) {
  logger.info(
    `[reject] Rejecting action ${actionId.slice(0, 8)} for user ${userId.slice(0, 8)}${options?.itemIndex !== undefined ? ` (item ${options.itemIndex})` : ""}`,
  );
  const action = await prisma.client.agentAction.findFirst({
    where: { id: actionId, userId },
  });
  if (!action) {
    logger.warn(`[reject] Action ${actionId.slice(0, 8)} not found for user ${userId.slice(0, 8)}`);
    throw new NotFoundException("Agent action not found");
  }
  if (action.status !== AgentActionStatus.PROPOSED) {
    logger.warn(`[reject] Action ${actionId.slice(0, 8)} is ${action.status} — cannot reject`);
    throw new BadRequestException(`Action is ${action.status}`);
  }

  if (action.tool === "transactions.bulkCreate") {
    return executeBulkReject(prisma, auditService, action, userId, options?.itemIndex);
  }

  const updated = await prisma.client.agentAction.update({
    where: { id: action.id },
    data: { status: AgentActionStatus.REJECTED },
  });
  await auditService.record({
    userId,
    runId: action.id,
    action: "action.reject",
    tool: action.tool,
    status: "rejected",
  });
  logger.log(
    `Rejected action "${action.tool}" (actionId: ${actionId.slice(0, 8)}, userId: ${userId.slice(0, 8)})`,
  );
  return { rejected: true as const, action: updated };
}

export async function listProposedActions(
  prisma: PrismaService,
  logger: Logger,
  userId: string,
  conversationId?: string,
) {
  logger.debug(
    `[listProposed] Listing pending actions for user ${userId.slice(0, 8)}${conversationId ? ` (convo: ${conversationId.slice(0, 8)})` : ""}`,
  );
  return prisma.client.agentAction.findMany({
    where: {
      userId,
      status: AgentActionStatus.PROPOSED,
      expiresAt: { gt: new Date() },
      ...(conversationId && { conversationId }),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function listActionsByConversation(
  prisma: PrismaService,
  cardBuilder: (tool: string, input: unknown, userId: string) => Promise<AgentCard>,
  userId: string,
  conversationId: string,
) {
  const actions = await prisma.client.agentAction.findMany({
    where: { userId, conversationId },
    orderBy: { createdAt: "asc" },
  });
  const sMap: Record<string, string> = {
    PROPOSED: "pending",
    EXECUTED: "executed",
    REJECTED: "rejected",
    FAILED: "failed",
    EXPIRED: "rejected",
  };
  return Promise.all(
    actions.map(async (a) => ({
      actionId: a.id,
      tool: a.tool,
      card: await cardBuilder(a.tool, a.input, userId),
      status: sMap[a.status] ?? "pending",
      result: a.result,
      createdAt: a.createdAt.toISOString(),
    })),
  );
}
