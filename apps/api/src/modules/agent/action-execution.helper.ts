import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AgentActionStatus, Prisma } from "@finai/database";
import type { PrismaService } from "@/modules/prisma/prisma.service";
import type { ToolRegistry } from "./tool-registry";
import type { AuditService } from "./audit.service";
import type { Logger } from "@yuva-devlab/logger";
import type { AgentContext } from "./agent.types";
import { executeBulkConfirm } from "./bulk-action.helper";

export async function executeActionConfirm(
  prisma: PrismaService,
  registry: ToolRegistry,
  auditService: AuditService,
  logger: Logger,
  actionId: string,
  userId: string,
  options?: { itemIndex?: number },
) {
  const action = await prisma.client.agentAction.findFirst({
    where: { id: actionId, userId },
  });
  if (!action) {
    throw new NotFoundException("Agent action not found");
  }

  // Idempotency: re-confirming an executed action returns the original result.
  if (action.status === AgentActionStatus.EXECUTED) {
    return { alreadyExecuted: true as const, result: action.result };
  }
  if (action.status !== AgentActionStatus.PROPOSED) {
    throw new BadRequestException(`Action is ${action.status}`);
  }
  if (action.expiresAt.getTime() < Date.now()) {
    await prisma.client.agentAction.update({
      where: { id: action.id },
      data: { status: AgentActionStatus.EXPIRED },
    });
    logger.warn(
      `Action "${action.tool}" (${actionId.slice(0, 8)}) expired at ${action.expiresAt.toISOString()}`,
    );
    throw new BadRequestException("Action confirmation expired");
  }

  if (action.tool === "transactions.bulkCreate") {
    return executeBulkConfirm(prisma, registry, auditService, action, userId, options?.itemIndex);
  }

  const tool = registry.get(action.tool);
  if (!tool) {
    throw new BadRequestException(`Unknown tool: ${action.tool}`);
  }

  const parsed = tool.schema.parse(action.input);
  const ctx: AgentContext = {
    userId,
    conversationId: action.conversationId,
    runId: action.id,
  };

  try {
    const output = await tool.execute(parsed, ctx);
    const updated = await prisma.client.agentAction.update({
      where: { id: action.id },
      data: {
        status: AgentActionStatus.EXECUTED,
        result: output as Prisma.InputJsonValue,
        executedAt: new Date(),
      },
    });
    await auditService.record({
      userId,
      runId: action.id,
      action: "action.confirm",
      tool: action.tool,
      status: "success",
      after: output,
    });
    logger.info(
      `Confirmed action "${action.tool}" (actionId: ${action.id.slice(0, 8)}, userId: ${userId.slice(0, 8)}) — executed successfully`,
    );
    return { alreadyExecuted: false as const, action: updated, result: output };
  } catch (error) {
    await prisma.client.agentAction.update({
      where: { id: action.id },
      data: {
        status: AgentActionStatus.FAILED,
        error: (error as Error).message,
      },
    });
    await auditService.record({
      userId,
      runId: action.id,
      action: "action.confirm",
      tool: action.tool,
      status: "error",
      metadata: { error: (error as Error).message },
    });
    logger.error(
      `Failed to execute confirmed action "${action.tool}" (actionId: ${action.id.slice(0, 8)}, userId: ${userId.slice(0, 8)}): ${(error as Error).message}`,
    );
    throw error;
  }
}
