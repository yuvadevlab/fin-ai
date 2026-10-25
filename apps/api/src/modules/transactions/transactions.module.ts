import { Module } from "@nestjs/common";
import { TransactionsController } from "./transactions.controller";
import { TransactionsRepository } from "./repositories";
import {
  TransactionsService,
  TransactionsMutationService,
  TransactionsSummaryService,
  TransactionsExportService,
} from "./services";
import { TransactionsBulkService } from "./services/transactions-bulk.service";

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsRepository,
    TransactionsBulkService,
    TransactionsMutationService,
    TransactionsSummaryService,
    TransactionsExportService,
    TransactionsService,
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
