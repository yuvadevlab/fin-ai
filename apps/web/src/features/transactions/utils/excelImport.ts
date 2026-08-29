import * as XLSX from "xlsx";
import { format } from "date-fns";
import { API_BASE_URL } from "@/lib/api-client";
import { BulkRow } from "@/features/transactions/components/BulkTransactionForm";

export interface SelectOption {
  label: string;
  value: string;
}

function generateRowId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `row_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Downloads the dynamic Excel template directly from the backend API.
 */
export async function downloadExcelTemplateFromApi() {
  const token = typeof window !== "undefined" ? localStorage.getItem("finai_token") : null;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/transactions/template`, {
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

        // Header mapping
        const headerRow = (rawData[0] || []).map((h) => String(h).toLowerCase().trim());

        const getColIndex = (keywords: string[]) => {
          return headerRow.findIndex((h) => keywords.some((k) => h.includes(k)));
        };

        const dateIdx = getColIndex(["date"]);
        const typeIdx = getColIndex(["type", "kind"]);
        const amountIdx = getColIndex(["amount", "price", "val"]);
        const categoryIdx = getColIndex(["category", "cat"]);
        const accountIdx = getColIndex(["account", "from account", "src"]);
        const toAccountIdx = getColIndex(["to account", "dest", "to"]);
        const notesIdx = getColIndex(["note", "desc", "remark", "summary"]);

        const parsedRows: BulkRow[] = [];
        const todayStr = format(new Date(), "yyyy-MM-dd");

        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i] as unknown[];
          if (!row || row.every((cell) => cell === "" || cell === null)) continue;

          // Raw values
          const rawAmount = String(row[amountIdx >= 0 ? amountIdx : 2] || "").replace(
            /[^0-9.]/g,
            "",
          );
          const rawType = String(row[typeIdx >= 0 ? typeIdx : 1] || "").toLowerCase();
          const rawCat = String(row[categoryIdx >= 0 ? categoryIdx : 3] || "").trim();
          const rawAcc = String(row[accountIdx >= 0 ? accountIdx : 4] || "").trim();
          const rawToAcc = String(row[toAccountIdx >= 0 ? toAccountIdx : 5] || "").trim();
          const rawDate = row[dateIdx >= 0 ? dateIdx : 0];
          const rawNotes = String(row[notesIdx >= 0 ? notesIdx : 6] || "").trim();

          if (!rawAmount || parseFloat(rawAmount) <= 0) continue;

          // Parse Type
          let kind: "expense" | "income" | "transfer" = "expense";
          if (rawType.includes("inc") || rawType.includes("credit")) kind = "income";
          else if (rawType.includes("trans")) kind = "transfer";

          // Match Category ID
          const matchedCat =
            categories.find((c) => c.label.toLowerCase() === rawCat.toLowerCase()) ||
            categories.find((c) => c.label.toLowerCase().includes(rawCat.toLowerCase())) ||
            categories[0];

          // Match Account ID
          const matchedAcc =
            accounts.find((a) => a.label.toLowerCase().includes(rawAcc.toLowerCase())) ||
            accounts.find((a) => a.value === rawAcc) ||
            accounts[0];

          // Match To Account ID
          const matchedToAcc = rawToAcc
            ? accounts.find((a) => a.label.toLowerCase().includes(rawToAcc.toLowerCase()))?.value
            : undefined;

          // Parse Date (handles DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, native JS Date)
          let formattedDate = todayStr;
          if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
            formattedDate = format(rawDate, "yyyy-MM-dd");
          } else if (typeof rawDate === "string" && rawDate.trim()) {
            const str = rawDate.trim();
            const ddmmyyyyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
            if (ddmmyyyyMatch) {
              const [, day, month, year] = ddmmyyyyMatch;
              const d = new Date(Number(year), Number(month) - 1, Number(day));
              if (!isNaN(d.getTime())) {
                formattedDate = format(d, "yyyy-MM-dd");
              }
            } else {
              const parsedD = new Date(str);
              if (!isNaN(parsedD.getTime())) {
                formattedDate = format(parsedD, "yyyy-MM-dd");
              }
            }
          }

          parsedRows.push({
            id: generateRowId(),
            amount: rawAmount,
            kind,
            category: matchedCat?.value || categories[0]?.value || "",
            account: matchedAcc?.value || accounts[0]?.value || "",
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
