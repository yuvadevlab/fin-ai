import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionFilterSchema,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from "@finai/validation";

@ApiTags("Transactions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("workspaces/:workspaceId/transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: "List all transactions in a workspace" })
  findAll(@Param("workspaceId") workspaceId: string, @Query() query: TransactionFilterInput) {
    const filter = transactionFilterSchema.parse(query);
    return this.transactionsService.findAll(workspaceId, filter);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single transaction" })
  findOne(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.transactionsService.findOne(id, workspaceId);
  }

  @Post()
  @ApiOperation({ summary: "Create a transaction" })
  create(
    @Param("workspaceId") workspaceId: string,
    @Body(new ZodValidationPipe(createTransactionSchema))
    body: CreateTransactionInput,
  ) {
    return this.transactionsService.create(workspaceId, body);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a transaction" })
  update(
    @Param("workspaceId") workspaceId: string,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateTransactionSchema))
    body: UpdateTransactionInput,
  ) {
    return this.transactionsService.update(id, workspaceId, body);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a transaction" })
  remove(@Param("workspaceId") workspaceId: string, @Param("id") id: string) {
    return this.transactionsService.remove(id, workspaceId);
  }
}
