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
import { type Response } from "express";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionsService } from "./services";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { WorkspaceGuard } from "@/common/guards/workspace.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { CurrentWorkspace } from "@/common/decorators/current-workspace.decorator";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { Logger } from "@yuva-devlab/logger";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
  createBulkTransactionsSchema,
  type CreateTransactionInput,
  type UpdateTransactionInput,
  type TransactionFilterInput,
  type CreateBulkTransactionsInput,
} from "@finai/validation";

@ApiTags("Transactions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller("transactions")
export class TransactionsController {
  private readonly logger = new Logger(TransactionsController.name);
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: "List all transactions for the current workspace" })
  findAll(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @CurrentWorkspace("memberUserIds") memberUserIds: string[] | undefined,
    @Query() query: TransactionFilterInput,
  ) {
    this.logger.info(
      `[findAll] Listing transactions for user ${userId.slice(0, 8)} in workspace ${workspaceId.slice(0, 8)}`,
    );
    const filter = transactionFilterSchema.parse(query);
    return this.transactionsService.findAll(userId, filter, workspaceId, memberUserIds);
  }

  @Get("template")
  @ApiOperation({
    summary: "Generate and download dynamic Excel template with in-cell DDL dropdowns",
  })
  async downloadTemplate(@CurrentUser("id") userId: string, @Res() res: Response) {
    this.logger.info(`[downloadTemplate] Generating Excel template for user ${userId.slice(0, 8)}`);
    const buffer = await this.transactionsService.generateExcelTemplate(userId);
    this.logger.info(
      `[downloadTemplate] Template generated (${buffer.length} bytes) for user ${userId.slice(0, 8)}`,
    );
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
  findOne(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @CurrentWorkspace("memberUserIds") memberUserIds: string[] | undefined,
    @Param("id") id: string,
  ) {
    this.logger.info(
      `[findOne] Fetching transaction ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.transactionsService.findOne(id, userId, workspaceId, memberUserIds);
  }

  @Post("bulk")
  @ApiOperation({ summary: "Create multiple transactions in a single bulk batch" })
  createBulk(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Body(new ZodValidationPipe(createBulkTransactionsSchema))
    body: CreateBulkTransactionsInput,
  ) {
    this.logger.info(
      `[createBulk] Bulk creating ${(body as unknown as unknown[]).length ?? "?"} transaction(s) for user ${userId.slice(0, 8)}`,
    );
    return this.transactionsService.createBulk(userId, body, workspaceId);
  }

  @Post()
  @ApiOperation({ summary: "Create a transaction" })
  create(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Body(new ZodValidationPipe(createTransactionSchema))
    body: CreateTransactionInput,
  ) {
    this.logger.info(
      `[create] Creating ${body.type} transaction amount: ${body.amount} (workspace: ${workspaceId.slice(0, 8)})`,
    );
    return this.transactionsService.create(userId, body, workspaceId);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a transaction" })
  update(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTransactionSchema))
    body: UpdateTransactionInput,
  ) {
    this.logger.info(
      `[update] Updating transaction ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.transactionsService.update(id, userId, body, workspaceId);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a transaction" })
  remove(
    @CurrentUser("id") userId: string,
    @CurrentWorkspace("id") workspaceId: string,
    @Param("id") id: string,
  ) {
    this.logger.info(
      `[remove] Deleting transaction ${id.slice(0, 8)} for user ${userId.slice(0, 8)}`,
    );
    return this.transactionsService.remove(id, userId, workspaceId);
  }
}
