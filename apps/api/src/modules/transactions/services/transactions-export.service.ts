import { Injectable } from "@nestjs/common";
import { Logger } from "@finai/logger";
import { PrismaService } from "@/modules/prisma/prisma.service";
import ExcelJS from "exceljs";

/** Generates the Excel bulk-upload template with in-cell dropdowns. */
@Injectable()
export class TransactionsExportService {
  private readonly logger = new Logger(TransactionsExportService.name);
  constructor(private prisma: PrismaService) {}

  async generateExcelTemplate(userId: string): Promise<Buffer> {
    this.logger.debug(`[generateExcelTemplate] Building template for user ${userId.slice(0, 8)}`);
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

    // ─── Sheet 1: FinAI_Bulk_Upload ──────────────────────────────────────────
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

    const headerRow = wsImport.getRow(1);
    headerRow.height = 32;
    headerRow.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFF" } };
    headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0F172A" } };
      cell.border = {
        top: { style: "medium", color: { argb: "334155" } },
        left: { style: "thin", color: { argb: "334155" } },
        bottom: { style: "medium", color: { argb: "334155" } },
        right: { style: "thin", color: { argb: "334155" } },
      };
      cell.protection = { locked: true };
    });

    // ─── Sheet 2: Reference_Lists ────────────────────────────────────────────
    const wsRef = workbook.addWorksheet("Reference_Lists", { views: [{ showGridLines: true }] });
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

    for (let r = 2; r <= 500; r++) {
      const rowObj = wsImport.getRow(r);
      rowObj.height = 22;
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
    this.logger.log(
      `[generateExcelTemplate] Template built: ${accounts.length} account(s), ${categories.length} categorie(s) (user: ${userId.slice(0, 8)})`,
    );
    return Buffer.from(buffer);
  }
}
