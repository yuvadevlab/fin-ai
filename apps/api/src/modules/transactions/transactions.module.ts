import { Module } from "@nestjs/common";
import { TransactionsController } from "./transactions.controller";
import { TransactionsRepository } from "./repositories";
import {
  TransactionsService,
  TransactionsMutationService,
  TransactionsSummaryService,
  TransactionsExportService,
} from "./services";

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsRepository,
    TransactionsMutationService,
    TransactionsSummaryService,
    TransactionsExportService,
    TransactionsService,
  ],
  exports: [TransactionsService],
})
export class TransactionsModule {}
