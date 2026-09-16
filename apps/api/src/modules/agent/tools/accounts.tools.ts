import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { Account } from "@finai/shared-types";
import { createAccountSchema, updateAccountSchema } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";

/**
 * Read + write tools over the existing AccountsService.
 *
 * Each tool is a thin adapter: validate LLM input with a Zod schema, call a
 * domain service (which enforces ownership + business rules), then serialize
 * a compact result for the model. Confirmation gating follows write risk:
 * rename is cosmetic ("none"), create/update/delete are "required".
 */
export function createAccountsTools(accountsService: AccountsService) {
  return [
    defineTool({
      name: "accounts.list",
      description:
        "List the user's active FinAI accounts with balances, types, and the default account flag. Use this to resolve account names (e.g. 'my HDFC account') to IDs.",
      access: "read",
      confirmation: "none",
      label: "Reviewing your accounts",
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const accounts = await accountsService.findAll(ctx.userId);
        return { accounts };
      },
      summarize: (output) => {
        const { accounts } = output as { accounts: Account[] };
        return `Retrieved ${accounts.length} account(s)`;
      },
    }),
    defineTool({
      name: "accounts.get",
      description:
        "Get details of a single account by ID. Use this to confirm an account exists and check its current balance before recording a transaction against it.",
      access: "read",
      confirmation: "none",
      label: "Fetching account details",
      schema: z.object({
        accountId: z.string().uuid("Invalid account ID"),
      }),
      execute: async (input, ctx) => accountsService.findOne(input.accountId, ctx.userId),
      summarize: (output) => {
        const account = output as Account;
        return `Account ${account.name} (${account.type}) balance ${formatINR(account.balance)}`;
      },
    }),
    defineTool({
      name: "accounts.create",
      description:
        "Create (link) a new FinAI account for the user. Requires confirmation. Fields: name, type (BANK | CREDIT_CARD | WALLET | CASH), optional opening balance (defaults 0), currency (defaults INR), optional isDefault flag.",
      access: "write",
      confirmation: "required",
      label: "Creating your account",
      invalidates: ["accounts", "analytics"],
      schema: createAccountSchema,
      execute: async (input, ctx) => accountsService.create(ctx.userId, input),
      serialize: (output) => {
        const account = output as Account;
        return {
          id: account.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          currency: account.currency,
        };
      },
      describe: (input) => {
        const rows: [string, string][] = [
          ["Name", input.name],
          ["Type", input.type],
          ["Opening balance", formatINR(input.balance ?? 0)],
          ["Currency", input.currency ?? "INR"],
        ];
        if (input.isDefault) rows.push(["Set as default", "Yes"]);
        return { type: "confirmation" as const, title: "Create account", rows };
      },
      summarize: (output) => `Created account ${(output as Account).name}`,
    }),
    defineTool({
      name: "accounts.rename",
      description:
        "Rename one of the user's FinAI accounts. Safe cosmetic change — no confirmation needed. Resolve the account ID with accounts.list first.",
      access: "write",
      confirmation: "none",
      label: "Renaming account",
      invalidates: ["accounts"],
      schema: z.object({
        accountId: z.string().uuid("Invalid account ID"),
        name: z.string().min(1, "Account name is required").max(100),
      }),
      execute: async (input, ctx) =>
        accountsService.update(input.accountId, ctx.userId, { name: input.name }),
      serialize: (output) => {
        const account = output as Account;
        return { id: account.id, name: account.name };
      },
      summarize: (output) => `Renamed account to ${(output as Account).name}`,
    }),
    defineTool({
      name: "accounts.update",
      description:
        "Update an account's balance or mark it as the user's default account. Requires confirmation. Only name, balance and isDefault are supported; type and currency cannot be changed.",
      access: "write",
      confirmation: "required",
      label: "Updating account",
      invalidates: ["accounts", "analytics"],
      schema: updateAccountSchema.extend({
        accountId: z.string().uuid("Invalid account ID"),
      }),
      execute: async (input, ctx) => {
        const { accountId, ...changes } = input;
        return accountsService.update(accountId, ctx.userId, changes);
      },
      serialize: (output) => {
        const account = output as Account;
        return { id: account.id, name: account.name, balance: account.balance };
      },
      describe: (input) => {
        const rows: [string, string][] = [["Account ID", input.accountId]];
        if (input.name !== undefined) rows.push(["Name", input.name]);
        if (input.balance !== undefined) rows.push(["Balance", formatINR(input.balance)]);
        if (input.isDefault === true) rows.push(["Set as default", "Yes"]);
        return { type: "confirmation" as const, title: "Update account", rows };
      },
      summarize: (output) => `Updated account ${(output as Account).name}`,
    }),
    defineTool({
      name: "accounts.delete",
      description:
        "Deactivate (soft-delete) one of the user's FinAI accounts. Requires confirmation. The account is hidden from the app but its history is retained; transactions are not deleted.",
      access: "write",
      confirmation: "required",
      label: "Removing account",
      invalidates: ["accounts", "analytics"],
      schema: z.object({
        accountId: z.string().uuid("Invalid account ID"),
      }),
      execute: async (input, ctx) => accountsService.remove(input.accountId, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Remove account",
        rows: [
          ["Account ID", input.accountId],
          ["Effect", "The account will be deactivated (soft delete)"],
        ],
      }),
      summarize: () => "Account removed",
    }),
  ];
}
