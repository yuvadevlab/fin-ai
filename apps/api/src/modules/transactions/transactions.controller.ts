import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/modules/analytics/analytics.service";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
  createBulkTransactionsSchema,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
  CreateBulkTransactionsInput,
} from "@finai/validation";

@ApiTags("Transactions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: "List all transactions for the current user" })
  findAll(@CurrentUser("id") userId: string, @Query() query: TransactionFilterInput) {
    const filter = transactionFilterSchema.parse(query);
    return this.transactionsService.findAll(userId, filter);
  }

  @Get("template")
  @ApiOperation({
    summary: "Generate and download dynamic Excel template with in-cell DDL dropdowns",
  })
  async downloadTemplate(@CurrentUser("id") userId: string, @Res() res: Response) {
    const buffer = await this.transactionsService.generateExcelTemplate(userId);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=FinAI_Bulk_Transactions_Upload_Template.xlsx`,
    );
    res.send(buffer);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single transaction" })
  findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.transactionsService.findOne(id, userId);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create multiple transactions in a single bulk batch" })
  createBulk(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createBulkTransactionsSchema))
    body: CreateBulkTransactionsInput,
  ) {
    return this.transactionsService.createBulk(userId, body);
  }

  @Post()
  @ApiOperation({ summary: "Create a transaction" })
  create(
    @CurrentUser("id") userId: string,
    @Body(new ZodValidationPipe(createTransactionSchema))
    body: CreateTransactionInput,
  ) {
    return this.transactionsService.create(userId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a transaction" })
  update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTransactionSchema))
    body: UpdateTransactionInput,
  ) {
    return this.transactionsService.update(id, userId, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a transaction" })
  remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return this.transactionsService.remove(id, userId);
  }
}
