import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { Prisma, TransactionType } from "@finai/database";
import ExcelJS from "exceljs";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from "@finai/validation";

export interface TransactionSummarizeFilter {
  /** Inclusive range start (ISO date string). */
  dateFrom: string;
  /** Inclusive range end (ISO date string). */
  dateTo: string;
  /** Aggregate by category name or by transaction type. */
  groupBy: "category" | "type";
  /** Optional transaction type filter. */
  type?: TransactionType;
}

export interface TransactionSummaryItem {
  /** Category name (when grouped by category) or transaction type. */
  key: string;
  /** Sum of amounts for the group. */
  total: number;
}

/**
 * Service for managing financial transactions.
 *
 * Transactions are the core records in FinAI. Each transaction represents
 * a movement of money and comes in three types:
 *
 * - `INCOME`  → money received (salary, interest, etc.) — increases account balance.
 * - `EXPENSE` → money spent — decreases account balance.
 * - `TRANSFER`→ money moved between two of the user's accounts — decreases one,
 *               increases the other.
 *
 * BALANCE IMPACT MODEL:
 * Every transaction mutates one or two account balances via `applyImpact()`.
 * The multiplier parameter lets callers revert a previous impact (multiplier = -1)
 * before applying a new one — used by `update()` to undo the old amount/type
 * before applying the corrected one.
 *
 * All methods require `userId` and enforce ownership via Prisma `where` clauses.
 * Write operations (`create`, `update`, `createBulk`) run inside a Prisma
 * `$transaction` so the transaction record and the account balance update
 * commit atomically.
 */
@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns paginated transactions for the user with optional filters.
   *
   * Filters are additive: only transactions matching ALL provided filters are
   * returned. Supported filters: search (case-insensitive notes match),
   * category, account, type, and date range.
   *
   * Always includes the related category, source account, and destination
   * account (for transfers) so callers don't need separate lookups.
   *
   * Returns both the page of items and the total count so the frontend can
   * render pagination controls.
   */
  async findAll(userId: string, filter: TransactionFilterInput) {
    const where: Prisma.TransactionWhereInput = { userId };

    if (filter.search) {
      where.notes = { contains: filter.search, mode: "insensitive" };
    }
    if (filter.category) where.categoryId = filter.category;
    if (filter.account) where.accountId = filter.account;
    if (filter.type) where.type = filter.type as TransactionType;

    if (filter.dateFrom || filter.dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filter.dateFrom) dateFilter.gte = new Date(filter.dateFrom);
      if (filter.dateTo) dateFilter.lte = new Date(filter.dateTo);
      where.date = dateFilter;
    }

    const page = filter.page ?? 1;
    const limit = filter.pageSize ?? 50;

    const [items, total] = await Promise.all([
      this.prisma.client.transaction.findMany({
        where,
        include: {
          category: true,
          account: { select: { id: true, name: true, type: true } },
          toAccount: { select: { id: true, name: true, type: true } },
          investment: { select: { id: true, name: true, assetClass: true } },
          goal: { select: { id: true, name: true, targetAmount: true } },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.transaction.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Fetches a single transaction by ID, scoped to the user.
   * Throws `NotFoundException` if the transaction doesn't exist or belongs
   * to another user.
   *
   * Includes the full related records (category, both accounts, investment, goal)
   * so the frontend can render a detail view without additional API calls.
   */
  async findOne(id: string, userId: string) {
    const tx = await this.prisma.client.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        account: true,
        toAccount: true,
        investment: true,
        goal: true,
      },
    });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
    return tx;
  }

  /**
   * Computes the balance delta for a given transaction type and amount.
   *
   * Returns two values: how much the source account balance changes, and
   * how much the destination account (for transfers) changes.
   *
   * - INCOME:   source +amount, destination 0
   * - EXPENSE:  source -amount, destination 0
   * - TRANSFER: source -amount, destination +amount
   *
   * Pure function — no I/O, no side effects. Used by `applyImpact`.
   */
  private getTransactionImpact(type: TransactionType, amount: number) {
    if (type === TransactionType.INCOME) {
      return { accountChange: amount, toAccountChange: 0 };
    }
    if (type === TransactionType.EXPENSE) {
      return { accountChange: -amount, toAccountChange: 0 };
    }
    if (type === TransactionType.TRANSFER) {
      return { accountChange: -amount, toAccountChange: amount };
    }
    if (type === TransactionType.INVESTMENT) {
      return { accountChange: -amount, toAccountChange: 0 };
    }
    if (type === TransactionType.GOAL) {
      return { accountChange: -amount, toAccountChange: 0 };
    }
    return { accountChange: 0, toAccountChange: 0 };
  }

  /**
   * Applies a balance change to the affected account(s), investment, or goal.
   *
   * The `multiplier` parameter lets callers REVERSE a previous impact by
   * passing -1. This is used by `update()`: when a transaction's amount or
   * type changes, we first call `applyImpact(..., -1)` to undo the old impact,
   * then call it again with multiplier 1 to apply the new one.
   *
   * Runs inside a Prisma `$transaction` (the `txClient` parameter) so the
   * balance change commits atomically with the transaction record.
   */
  private async applyImpact(
    txClient: Prisma.TransactionClient,
    type: TransactionType,
    amount: number,
    accountId?: string | null,
    toAccountId?: string | null,
    investmentId?: string | null,
    goalId?: string | null,
    multiplier: number = 1,
  ) {
    const { accountChange, toAccountChange } = this.getTransactionImpact(type, amount);

    if (accountId && accountChange !== 0) {
      await txClient.account.update({
        where: { id: accountId },
        data: { balance: { increment: accountChange * multiplier } },
      });
    }

    if (toAccountId && toAccountChange !== 0) {
      await txClient.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: toAccountChange * multiplier } },
      });
    }

    if (type === TransactionType.INVESTMENT && investmentId) {
      await txClient.investment.update({
        where: { id: investmentId },
        data: {
          investedAmount: { increment: amount * multiplier },
          currentValue: { increment: amount * multiplier },
        },
      });
    }

    if (type === TransactionType.GOAL && goalId) {
      await txClient.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: amount * multiplier },
        },
      });
    }
  }

  /**
   * Guard against Prisma foreign-key 500s: verify every referenced entity
   * exists and belongs to the user before writing.
   */
  private async assertOwnedRefs(
    userId: string,
    refs: {
      accountId?: string | null;
      toAccountId?: string | null;
      categoryId?: string | null;
      investmentId?: string | null;
      goalId?: string | null;
    },
  ) {
    const missing: string[] = [];

    if (refs.accountId) {
      const account = await this.prisma.client.account.findFirst({
        where: { id: refs.accountId, userId, isActive: true },
        select: { id: true },
      });
      if (!account) missing.push(`account ${refs.accountId}`);
    }
    if (refs.toAccountId) {
      const toAccount = await this.prisma.client.account.findFirst({
        where: { id: refs.toAccountId, userId, isActive: true },
        select: { id: true },
      });
      if (!toAccount) missing.push(`destination account ${refs.toAccountId}`);
    }
    if (refs.categoryId) {
      const category = await this.prisma.client.category.findFirst({
        where: { id: refs.categoryId, userId },
        select: { id: true },
      });
      if (!category) missing.push(`category ${refs.categoryId}`);
    }
    if (refs.investmentId) {
      const investment = await this.prisma.client.investment.findFirst({
        where: { id: refs.investmentId, userId },
        select: { id: true },
      });
      if (!investment) missing.push(`investment ${refs.investmentId}`);
    }
    if (refs.goalId) {
      const goal = await this.prisma.client.goal.findFirst({
        where: { id: refs.goalId, userId },
        select: { id: true },
      });
      if (!goal) missing.push(`goal ${refs.goalId}`);
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Cannot record transaction: ${missing.join(", ")} not found for this user`,
      );
    }
  }

  /**
   * Creates a new transaction and atomically applies its balance impact.
   *
   * Steps (all inside one Prisma `$transaction`):
   * 1. Validate that the category, account(s), investment, or goal belong to the user
   *    (`assertOwnedRefs`).
   * 2. Create the transaction record.
   * 3. Apply the balance impact via `applyImpact`.
   */
  async create(userId: string, input: CreateTransactionInput) {
    await this.assertOwnedRefs(userId, {
      accountId: input.accountId,
      toAccountId: input.toAccountId,
      categoryId: input.categoryId,
      investmentId: input.investmentId,
      goalId: input.goalId,
    });
    return this.prisma.client.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: input.accountId,
          toAccountId: input.toAccountId,
          categoryId: input.categoryId,
          investmentId: input.type === TransactionType.INVESTMENT ? input.investmentId : null,
          goalId: input.type === TransactionType.GOAL ? input.goalId : null,
          amount: input.amount,
          date: new Date(input.date),
          notes: input.notes,
          type: input.type as TransactionType,
        },
        include: {
          category: true,
          account: true,
          toAccount: true,
          investment: true,
          goal: true,
        },
      });

      await this.applyImpact(
        tx,
        transaction.type,
        transaction.amount,
        transaction.accountId,
        transaction.toAccountId,
        transaction.investmentId,
        transaction.goalId,
        1,
      );

      return transaction;
    });
  }

  async createBulk(userId: string, inputs: CreateTransactionInput[]) {
    for (const input of inputs) {
      await this.assertOwnedRefs(userId, {
        accountId: input.accountId,
        toAccountId: input.toAccountId,
        categoryId: input.categoryId,
        investmentId: input.investmentId,
        goalId: input.goalId,
      });
    }
    return this.prisma.client.$transaction(async (tx) => {
      const createdTransactions = [];
      for (const input of inputs) {
        const transaction = await tx.transaction.create({
          data: {
            userId,
            accountId: input.accountId,
            toAccountId: input.toAccountId,
            categoryId: input.categoryId,
            investmentId: input.type === TransactionType.INVESTMENT ? input.investmentId : null,
            goalId: input.type === TransactionType.GOAL ? input.goalId : null,
            amount: input.amount,
            date: new Date(input.date),
            notes: input.notes,
            type: input.type as TransactionType,
          },
          include: {
            category: true,
            account: true,
            toAccount: true,
            investment: true,
            goal: true,
          },
        });

        await this.applyImpact(
          tx,
          transaction.type,
          transaction.amount,
          transaction.accountId,
          transaction.toAccountId,
          transaction.investmentId,
          transaction.goalId,
          1,
        );
        createdTransactions.push(transaction);
      }
      return createdTransactions;
    });
  }

  async update(id: string, userId: string, input: UpdateTransactionInput) {
    await this.assertOwnedRefs(userId, {
      accountId: input.accountId,
      toAccountId: input.toAccountId,
      categoryId: input.categoryId,
      investmentId: input.investmentId,
      goalId: input.goalId,
    });
    return this.prisma.client.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, userId },
      });
      if (!oldTx) throw new NotFoundException(`Transaction ${id} not found`);

      // Revert old impact
      await this.applyImpact(
        tx,
        oldTx.type,
        oldTx.amount,
        oldTx.accountId,
        oldTx.toAccountId,
        oldTx.investmentId,
        oldTx.goalId,
        -1,
      );

      const targetType = (input.type as TransactionType) ?? oldTx.type;
      const targetInvestmentId =
        input.investmentId !== undefined
          ? targetType === TransactionType.INVESTMENT
            ? input.investmentId
            : null
          : targetType === TransactionType.INVESTMENT
            ? oldTx.investmentId
            : null;
      const targetGoalId =
        input.goalId !== undefined
          ? targetType === TransactionType.GOAL
            ? input.goalId
            : null
          : targetType === TransactionType.GOAL
            ? oldTx.goalId
            : null;

      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          ...(input.amount !== undefined && { amount: input.amount }),
          ...(input.date !== undefined && { date: new Date(input.date) }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.accountId !== undefined && { accountId: input.accountId }),
          ...(input.toAccountId !== undefined && { toAccountId: input.toAccountId }),
          ...(input.investmentId !== undefined && { investmentId: targetInvestmentId }),
          ...(input.goalId !== undefined && { goalId: targetGoalId }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.type !== undefined && {
            type: input.type as TransactionType,
          }),
        },
        include: {
          category: true,
          account: true,
          toAccount: true,
          investment: true,
          goal: true,
        },
      });

      // Apply new impact
      await this.applyImpact(
        tx,
        updatedTx.type,
        updatedTx.amount,
        updatedTx.accountId,
        updatedTx.toAccountId,
        updatedTx.investmentId,
        updatedTx.goalId,
        1,
      );

      return updatedTx;
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.client.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, userId },
      });
      if (!oldTx) throw new NotFoundException(`Transaction ${id} not found`);

      // Revert old impact
      await this.applyImpact(
        tx,
        oldTx.type,
        oldTx.amount,
        oldTx.accountId,
        oldTx.toAccountId,
        oldTx.investmentId,
        oldTx.goalId,
        -1,
      );

      await tx.transaction.delete({ where: { id } });
      return { deleted: true };
    });
  }

  /**
   * Re-categorize transactions matching a filter. When `dryRun` is true,
   * only reports the affected count and matched category IDs without mutating.
   * Re-categorization never touches account balances (only the category foreign key).
   */
  async recategorize(
    userId: string,
    filter: TransactionFilterInput,
    targetCategoryId: string,
    dryRun = false,
  ) {
    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filter.category && { categoryId: filter.category }),
      ...(filter.account && { accountId: filter.account }),
      ...(filter.type && { type: filter.type }),
      ...(filter.search && { notes: { contains: filter.search, mode: "insensitive" } }),
      ...(filter.dateFrom && { date: { gte: new Date(filter.dateFrom) } }),
      ...(filter.dateTo && { date: { lte: new Date(filter.dateTo) } }),
    };

    // Validate target category belongs to user
    const targetCategory = await this.prisma.client.category.findFirst({
      where: { id: targetCategoryId, userId },
    });
    if (!targetCategory) {
      throw new NotFoundException("Target category not found");
    }

    const matched = await this.prisma.client.transaction.findMany({
      where,
      select: { id: true },
    });

    if (dryRun) {
      return { dryRun: true, matched: matched.length, updated: 0 };
    }

    if (matched.length === 0) {
      return { dryRun: false, matched: 0, updated: 0 };
    }

    await this.prisma.client.transaction.updateMany({
      where: { id: { in: matched.map((t) => t.id) } },
      data: { categoryId: targetCategoryId },
    });

    return { dryRun: false, matched: matched.length, updated: matched.length };
  }

  /**
   * Deterministic aggregate totals for a date range, grouped by category
   * name or transaction type. Used by reporting and the agent tool layer.
   */
  async summarize(
    userId: string,
    filter: TransactionSummarizeFilter,
  ): Promise<TransactionSummaryItem[]> {
    const where: Prisma.TransactionWhereInput = {
      userId,
      date: {
        gte: new Date(filter.dateFrom),
        lte: new Date(filter.dateTo),
      },
      ...(filter.type !== undefined && { type: filter.type }),
    };

    if (filter.groupBy === "type") {
      const grouped = await this.prisma.client.transaction.groupBy({
        by: ["type"],
        where,
        _sum: { amount: true },
      });

      return grouped.map((g) => ({
        key: g.type,
        total: g._sum.amount ?? 0,
      }));
    }

    const grouped = await this.prisma.client.transaction.groupBy({
      by: ["categoryId"],
      where,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });

    const categoryIds = grouped.map((g) => g.categoryId).filter((id): id is string => id !== null);

    const categories = await this.prisma.client.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

    return grouped.map((g) => ({
      key: g.categoryId ? (categoryMap[g.categoryId] ?? "Unknown") : "Uncategorized",
      total: g._sum.amount ?? 0,
    }));
  }

  async generateExcelTemplate(userId: string): Promise<Buffer> {
    const [accounts, categories] = await Promise.all([
      this.prisma.client.account.findMany({
        where: { userId, isActive: true },
        select: { id: true, name: true, type: true },
        orderBy: { name: "asc" },
      }),
      this.prisma.client.category.findMany({
        where: { userId },
        select: { id: true, name: true, group: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "FinAI Financial Engine";
    workbook.created = new Date();

    // ─── Sheet 1: FinAI_Bulk_Upload ──────────────────────────────────────────────
    const wsImport = workbook.addWorksheet("FinAI_Bulk_Upload", {
      views: [{ showGridLines: true }],
    });

    wsImport.columns = [
      { header: "Date (DD/MM/YYYY)", key: "date", width: 20 },
      { header: "Type", key: "type", width: 16 },
      { header: "Amount (INR)", key: "amount", width: 18 },
      { header: "Category", key: "category", width: 30 },
      { header: "Account", key: "account", width: 30 },
      { header: "To Account (Optional)", key: "toAccount", width: 30 },
      { header: "Notes / Description", key: "notes", width: 38 },
    ];

    // Style Header Row & Lock Headers
    const headerRow = wsImport.getRow(1);
    headerRow.height = 32;
    headerRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0F172A" },
      };
      cell.border = {
        top: { style: "medium", color: { argb: "334155" } },
        left: { style: "thin", color: { argb: "334155" } },
        bottom: { style: "medium", color: { argb: "334155" } },
        right: { style: "thin", color: { argb: "334155" } },
      };
      cell.protection = { locked: true };
    });

    // ─── Sheet 2: Reference_Lists (Hidden Dropdown Sources) ──────────────────────
    const wsRef = workbook.addWorksheet("Reference_Lists", {
      views: [{ showGridLines: true }],
    });
    wsRef.state = "hidden";

    wsRef.columns = [
      { header: "Category Options", key: "catOpt", width: 32 },
      { header: "Account Options", key: "accOpt", width: 32 },
      { header: "Type Options", key: "typeOpt", width: 18 },
    ];

    const refHeader = wsRef.getRow(1);
    refHeader.height = 26;
    refHeader.font = { name: "Calibri", size: 10, bold: true, color: { argb: "475569" } };
    refHeader.alignment = { vertical: "middle", horizontal: "left" };

    const maxRows = Math.max(categories.length, accounts.length, 3);
    for (let i = 0; i < maxRows; i++) {
      wsRef.addRow({
        catOpt: categories[i]?.name || "",
        accOpt: accounts[i]?.name || "",
        typeOpt: i === 0 ? "Expense" : i === 1 ? "Income" : i === 2 ? "Transfer" : "",
      });
    }

    await wsRef.protect("finai_ref_protected", {
      selectLockedCells: true,
      selectUnlockedCells: true,
    });

    const categoriesCount = Math.max(categories.length, 1);
    const accountsCount = Math.max(accounts.length, 1);

    const categoryFormula = `'Reference_Lists'!$A$2:$A$${categoriesCount + 1}`;
    const accountFormula = `'Reference_Lists'!$B$2:$B$${accountsCount + 1}`;

    // Apply In-Cell Dropdown Data Validations (Rows 2 to 500)
    for (let r = 2; r <= 500; r++) {
      const rowObj = wsImport.getRow(r);
      rowObj.height = 22;

      // Date Formatting (Column A)
      wsImport.getCell(`A${r}`).numFmt = "dd/mm/yyyy";

      wsImport.getCell(`B${r}`).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ['"Expense,Income,Transfer"'],
        showErrorMessage: true,
        errorTitle: "Invalid Transaction Type",
        error: "Please select Expense, Income, or Transfer from the dropdown list.",
      };

      wsImport.getCell(`C${r}`).numFmt = "₹#,##0.00";

      if (categories.length > 0) {
        wsImport.getCell(`D${r}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [categoryFormula],
          showErrorMessage: true,
          errorTitle: "Invalid Category",
          error: "Please pick a category from your active category list.",
        };
      }

      if (accounts.length > 0) {
        wsImport.getCell(`E${r}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [accountFormula],
          showErrorMessage: true,
          errorTitle: "Invalid Source Account",
          error: "Please select an account from your linked accounts.",
        };

        wsImport.getCell(`F${r}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [accountFormula],
          showErrorMessage: true,
          errorTitle: "Invalid Destination Account",
          error: "Please select an account from your linked accounts.",
        };
      }

      ["A", "B", "C", "D", "E", "F", "G"].forEach((col) => {
        const cell = wsImport.getCell(`${col}${r}`);
        cell.border = {
          top: { style: "thin", color: { argb: "E2E8F0" } },
          left: { style: "thin", color: { argb: "E2E8F0" } },
          bottom: { style: "thin", color: { argb: "E2E8F0" } },
          right: { style: "thin", color: { argb: "E2E8F0" } },
        };
        cell.protection = { locked: false };
      });
    }

    await wsImport.protect("finai_sheet_protected", {
      selectLockedCells: true,
      selectUnlockedCells: true,
      formatCells: true,
      formatColumns: true,
      formatRows: true,
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
