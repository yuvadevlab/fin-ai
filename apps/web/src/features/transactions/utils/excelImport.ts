import * as XLSX from "xlsx";
import { format } from "date-fns";
import { API_BASE_URL } from "@/lib/api-client";
import { isJwtExpired } from "@/lib/jwt";
import { StorageKey, API_ENDPOINTS } from "@fin-ai/shared-types";
import { BulkRow } from "@/features/transactions/components/BulkTransactionForm";
import {
  type SelectOption,
  generateRowId,
  parseExcelDate,
  resolveColumnIndices,
  matchEntityOption,
  parseTransactionKind,
} from "./excelImport.helpers";

export * from "./excelImport.helpers";

/**
 * Downloads the dynamic Excel template directly from the backend API.
 * Attaches authentication tokens and active workspace headers.
 */
export async function downloadExcelTemplateFromApi(): Promise<void> {
  const headers: Record<string, string> = {};

  if (typeof window !== "undefined") {
    let token =
      localStorage.getItem(StorageKey.TOKEN) ||
      localStorage.getItem(StorageKey.DEVLAB_ACCESS_TOKEN) ||
      localStorage.getItem(StorageKey.DEVLAB_AUTH_TOKEN);

    if (!token && typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|;\s*)(?:finai_token|devlab_access_token)=([^;]+)/);
      if (match?.[1]) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (token) {
      if (isJwtExpired(token)) {
        throw new Error("Session expired. Please log in again.");
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    const activeWorkspaceId = localStorage.getItem(StorageKey.WORKSPACE_ID);
    if (activeWorkspaceId) {
      headers["X-Workspace-Id"] = activeWorkspaceId;
    }
  }

  const res = await fetch(`${API_BASE_URL}/${API_ENDPOINTS.TRANSACTIONS.TEMPLATE}`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error(`API returned ${res.status}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const a = document.createElement("a");
  a.href = url;
  a.download = `FinAI_Bulk_Transactions_Upload_Template_${todayStr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into BulkRow array.
 * Maps columns with conflict-free matching and resolves entities without destructive defaults.
 *
 * @param file - File selected by user.
 * @param accounts - List of user accounts.
 * @param categories - List of user categories.
 * @returns Array of validated, mapped BulkRow records.
 */
export async function parseExcelOrCsvFile(
  file: File,
  accounts: SelectOption[],
  categories: SelectOption[],
): Promise<BulkRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        const rawData: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: "",
        });

        if (rawData.length < 2) {
          throw new Error("Excel sheet contains no transaction rows.");
        }

        const indices = resolveColumnIndices(rawData[0] || []);
        const parsedRows: BulkRow[] = [];
        const todayStr = format(new Date(), "yyyy-MM-dd");

        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i] as unknown[];
          if (!row || row.every((cell) => cell === "" || cell === null)) continue;

          const rawAmount = String(row[indices.amountIdx] ?? "").replace(/[^0-9.]/g, "");
          const rawType = String(row[indices.typeIdx] ?? "").toLowerCase();
          const rawCat = String(row[indices.categoryIdx] ?? "").trim();
          const rawAcc = String(row[indices.accountIdx] ?? "").trim();
          const rawToAcc = String(row[indices.toAccountIdx] ?? "").trim();
          const rawDate = row[indices.dateIdx];
          const rawNotes = String(row[indices.notesIdx] ?? "").trim();

          if (!rawAmount || parseFloat(rawAmount) <= 0) continue;

          const kind = parseTransactionKind(rawType);
          const matchedCat = matchEntityOption(rawCat, categories);
          const matchedAcc = matchEntityOption(rawAcc, accounts);
          const matchedToAcc = rawToAcc ? matchEntityOption(rawToAcc, accounts)?.value : undefined;
          const formattedDate = parseExcelDate(rawDate, todayStr);

          parsedRows.push({
            id: generateRowId(),
            amount: rawAmount,
            kind,
            category: matchedCat?.value ?? "",
            account: matchedAcc?.value ?? "",
            toAccount: matchedToAcc,
            date: formattedDate,
            notes: rawNotes,
          });
        }

        if (parsedRows.length === 0) {
          throw new Error("Could not parse any valid transaction rows from the Excel file.");
        }

        resolve(parsedRows);
      } catch (err: unknown) {
        const parseErr = err as { message?: string };
        reject(parseErr?.message ? parseErr : new Error("Failed to process Excel file."));
      }
    };

    reader.onerror = () => reject(new Error("Error reading file."));
    reader.readAsArrayBuffer(file);
  });
}
