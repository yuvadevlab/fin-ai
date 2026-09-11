import { Injectable } from "@nestjs/common";
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
  constructor(
    private repo: TransactionsRepository,
    private mutation: TransactionsMutationService,
    private summary: TransactionsSummaryService,
    private export_: TransactionsExportService,
  ) {}

  findAll(userId: string, filter: TransactionFilterInput) {
    return this.repo.findAll(userId, filter);
  }

  findOne(id: string, userId: string) {
    return this.repo.findOne(id, userId);
  }

  create(userId: string, input: CreateTransactionInput) {
    return this.mutation.create(userId, input);
  }

  createBulk(userId: string, inputs: CreateTransactionInput[]) {
    return this.mutation.createBulk(userId, inputs);
  }

  update(id: string, userId: string, input: UpdateTransactionInput) {
    return this.mutation.update(id, userId, input);
  }

  remove(id: string, userId: string) {
    return this.mutation.remove(id, userId);
  }

  recategorize(
    userId: string,
    filter: TransactionFilterInput,
    targetCategoryId: string,
    dryRun = false,
  ) {
    return this.summary.recategorize(userId, filter, targetCategoryId, dryRun);
  }

  summarize(userId: string, filter: TransactionSummarizeFilter): Promise<TransactionSummaryItem[]> {
    return this.summary.summarize(userId, filter);
  }

  generateExcelTemplate(userId: string): Promise<Buffer> {
    return this.export_.generateExcelTemplate(userId);
  }
}
