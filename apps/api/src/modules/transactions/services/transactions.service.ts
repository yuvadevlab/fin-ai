import { Injectable } from "@nestjs/common";
import { Logger } from "@yuva-devlab/logger";
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from "@finai/validation";
import { TransactionsRepository } from "../repositories";
import { TransactionsMutationService } from "./transactions-mutation.service";
import {
  TransactionsSummaryService,
  TransactionSummarizeFilter,
  TransactionSummaryItem,
} from "./transactions-summary.service";
import { TransactionsExportService } from "./transactions-export.service";

export { TransactionSummarizeFilter, TransactionSummaryItem };

/**
 * Facade service that preserves the public API contract for the controller
 * and external callers (agent tools). Delegates all logic to specialized
 * sub-services — no DB or business logic lives here.
 */
@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);
  constructor(
    private repo: TransactionsRepository,
    private mutation: TransactionsMutationService,
    private summary: TransactionsSummaryService,
    private export_: TransactionsExportService,
  ) {}

  findAll(userId: string, filter: TransactionFilterInput) {
    this.logger.debug(
      `[findAll] Listing transactions for user ${userId.slice(0, 8)}, page: ${filter.page ?? 1}`,
    );
    return this.repo.findAll(userId, filter);
  }

  findOne(id: string, userId: string) {
    this.logger.debug(
      `[findOne] Fetching transaction ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.repo.findOne(id, userId);
  }

  create(userId: string, input: CreateTransactionInput) {
    this.logger.info(
      `[create] Creating ${input.type} transaction amount: ${input.amount} (user: ${userId.slice(0, 8)})`,
    );
    return this.mutation.create(userId, input);
  }

  createBulk(userId: string, inputs: CreateTransactionInput[]) {
    this.logger.info(
      `[createBulk] Bulk creating ${inputs.length} transaction(s) for user ${userId.slice(0, 8)}`,
    );
    return this.mutation.createBulk(userId, inputs);
  }

  update(id: string, userId: string, input: UpdateTransactionInput) {
    this.logger.info(
      `[update] Updating transaction ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.mutation.update(id, userId, input);
  }

  remove(id: string, userId: string) {
    this.logger.info(
      `[remove] Deleting transaction ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.mutation.remove(id, userId);
  }

  recategorize(
    userId: string,
    filter: TransactionFilterInput,
    targetCategoryId: string,
    dryRun = false,
  ) {
    if (dryRun) {
      this.logger.debug(
        `[recategorize] Dry-run recategorize to ${targetCategoryId.slice(0, 8)} for user ${userId.slice(0, 8)}`,
      );
    } else {
      this.logger.info(
        `[recategorize] Recategorizing to ${targetCategoryId.slice(0, 8)} for user ${userId.slice(0, 8)}`,
      );
    }
    return this.summary.recategorize(userId, filter, targetCategoryId, dryRun);
  }

  summarize(userId: string, filter: TransactionSummarizeFilter): Promise<TransactionSummaryItem[]> {
    this.logger.debug(
      `[summarize] Summarizing by ${filter.groupBy} from ${filter.dateFrom} to ${filter.dateTo} (user: ${userId.slice(0, 8)})`,
    );
    return this.summary.summarize(userId, filter);
  }

  generateExcelTemplate(userId: string): Promise<Buffer> {
    this.logger.debug(`[generateExcelTemplate] Generating template for user ${userId.slice(0, 8)}`);
    return this.export_.generateExcelTemplate(userId);
  }
}
