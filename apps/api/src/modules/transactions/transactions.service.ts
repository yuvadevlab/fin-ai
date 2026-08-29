import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { Prisma, TransactionType } from "@finai/database";
import ExcelJS from "exceljs";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
} from "@finai/validation";

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

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
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.transaction.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string, userId: string) {
    const tx = await this.prisma.client.transaction.findFirst({
      where: { id, userId },
      include: { category: true, account: true, toAccount: true },
    });
    if (!tx) throw new NotFoundException(`Transaction ${id} not found`);
    return tx;
  }

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
    return { accountChange: 0, toAccountChange: 0 };
  }

  private async applyImpact(
    txClient: Prisma.TransactionClient,
    type: TransactionType,
    amount: number,
    accountId?: string | null,
    toAccountId?: string | null,
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
  }

  async create(userId: string, input: CreateTransactionInput) {
    return this.prisma.client.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          accountId: input.accountId,
          toAccountId: input.toAccountId,
          categoryId: input.categoryId,
          amount: input.amount,
          date: new Date(input.date),
          notes: input.notes,
          type: input.type as TransactionType,
        },
        include: { category: true, account: true, toAccount: true },
      });

      await this.applyImpact(
        tx,
        transaction.type,
        transaction.amount,
        transaction.accountId,
        transaction.toAccountId,
        1,
      );

      return transaction;
    });
  }

  async createBulk(userId: string, inputs: CreateTransactionInput[]) {
    return this.prisma.client.$transaction(async (tx) => {
      const createdTransactions = [];
      for (const input of inputs) {
        const transaction = await tx.transaction.create({
          data: {
            userId,
            accountId: input.accountId,
            toAccountId: input.toAccountId,
            categoryId: input.categoryId,
            amount: input.amount,
            date: new Date(input.date),
            notes: input.notes,
            type: input.type as TransactionType,
          },
          include: { category: true, account: true, toAccount: true },
        });

        await this.applyImpact(
          tx,
          transaction.type,
          transaction.amount,
          transaction.accountId,
          transaction.toAccountId,
          1,
        );
        createdTransactions.push(transaction);
      }
      return createdTransactions;
    });
  }

  async update(id: string, userId: string, input: UpdateTransactionInput) {
    return this.prisma.client.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, userId },
      });
      if (!oldTx) throw new NotFoundException(`Transaction ${id} not found`);

      // Revert old impact
      await this.applyImpact(tx, oldTx.type, oldTx.amount, oldTx.accountId, oldTx.toAccountId, -1);

      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          ...(input.amount !== undefined && { amount: input.amount }),
          ...(input.date !== undefined && { date: new Date(input.date) }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
          ...(input.accountId !== undefined && { accountId: input.accountId }),
          ...(input.toAccountId !== undefined && { toAccountId: input.toAccountId }),
          ...(input.notes !== undefined && { notes: input.notes }),
          ...(input.type !== undefined && {
            type: input.type as TransactionType,
          }),
        },
        include: { category: true, account: true, toAccount: true },
      });

      // Apply new impact
      await this.applyImpact(
        tx,
        updatedTx.type,
        updatedTx.amount,
        updatedTx.accountId,
        updatedTx.toAccountId,
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
      await this.applyImpact(tx, oldTx.type, oldTx.amount, oldTx.accountId, oldTx.toAccountId, -1);

      await tx.transaction.delete({ where: { id } });
      return { deleted: true };
    });
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
