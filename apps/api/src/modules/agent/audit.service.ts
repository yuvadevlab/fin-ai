import { Injectable } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { Prisma } from "@finai/database";
import { PrismaService } from "@/modules/prisma/prisma.service";

/**
 * One audit-trail row. Optional fields are omitted (not nulled) in the
 * database insert so sparse rows stay readable in the JSON columns.
 */
export interface AuditEntry {
  /** User on whose behalf the action ran (always present — ownership key). */
  userId: string;
  /** Agent run that produced the event, when known. */
  runId?: string;
  /** Machine-readable verb, e.g. "tool.execute", "action.confirm". */
  action: string;
  /** Registry tool name, when the event relates to a specific tool. */
  tool?: string;
  /** Kind of entity touched (e.g. "Transaction"), when applicable. */
  entityType?: string;
  /** Id of the entity touched, when applicable. */
  entityId?: string;
  /** Snapshot of the entity before a mutation (updates/deletes). */
  before?: unknown;
  /** Snapshot of the result after a mutation/execution. */
  after?: unknown;
  /** Free-form outcome label: "success", "error", "proposed", "rejected". */
  status: string;
  /** Extra structured context (error messages, warning counts, …). */
  metadata?: Record<string, unknown>;
}

/**
 * Append-only audit trail. Audit failures are logged but never break the
 * agent run; financial correctness is enforced by the domain services.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Persists one audit row. All optional fields are spread conditionally so
   * JSON columns only contain meaningful keys. Audit failures are caught
   * and logged rather than thrown: losing a log line is preferable to
   * failing (or rolling back) a financial operation that already succeeded.
   */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.prisma.client.auditLog.create({
        data: {
          userId: entry.userId,
          ...(entry.runId && { runId: entry.runId }),
          action: entry.action,
          ...(entry.tool && { tool: entry.tool }),
          ...(entry.entityType && { entityType: entry.entityType }),
          ...(entry.entityId && { entityId: entry.entityId }),
          ...(entry.before !== undefined && {
            before: entry.before as Prisma.InputJsonValue,
          }),
          ...(entry.after !== undefined && {
            after: entry.after as Prisma.InputJsonValue,
          }),
          status: entry.status,
          ...(entry.metadata && {
            metadata: entry.metadata as Prisma.InputJsonValue,
          }),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log: ${(error as Error).message}`);
    }
  }
}
