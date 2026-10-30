import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { Account } from "@finai/shared-types";
import {
  AgentCardType,
  AgentToolName,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@finai/ai-engine";
import { createAccountSchema, updateAccountSchema } from "@finai/validation";
import { formatINR } from "@finai/finance-engine";
import { TOOL_MESSAGES } from "../tool-messages.constants";

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
      name: AgentToolName.ACCOUNTS_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ACCOUNTS_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.ACCOUNTS_LIST],
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const accounts = await accountsService.findAll(
          ctx.userId,
          ctx.workspaceId,
          ctx.memberUserIds,
        );
        return { accounts };
      },
      summarize: (output) => {
        const { accounts } = output as { accounts: Account[] };
        return TOOL_MESSAGES.ACCOUNTS.LISTED(accounts.length);
      },
    }),
    defineTool({
      name: AgentToolName.ACCOUNTS_GET,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ACCOUNTS_GET],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.ACCOUNTS_GET],
      schema: z.object({
        accountId: z.string().uuid("Invalid account ID"),
      }),
      execute: async (input, ctx) =>
        accountsService.findOne(input.accountId, ctx.userId, ctx.workspaceId, ctx.memberUserIds),
      summarize: (output) => {
        const account = output as Account;
        return `Account ${account.name} (${account.type}) balance ${formatINR(account.balance)}`;
      },
    }),
    defineTool({
      name: AgentToolName.ACCOUNTS_CREATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ACCOUNTS_CREATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.ACCOUNTS_CREATE],
      invalidates: [ToolInvalidationTag.ACCOUNTS, ToolInvalidationTag.ANALYTICS],
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
          [ConfirmationRowLabel.NAME, input.name],
          [ConfirmationRowLabel.TYPE, input.type],
          [ConfirmationRowLabel.OPENING_BALANCE, formatINR(input.balance ?? 0)],
          [ConfirmationRowLabel.CURRENCY, input.currency ?? "INR"],
        ];
        if (input.isDefault) rows.push([ConfirmationRowLabel.SET_AS_DEFAULT, "Yes"]);
        return {
          type: AgentCardType.CONFIRMATION,
          title: AGENT_TOOL_TITLES[AgentToolName.ACCOUNTS_CREATE],
          rows,
        };
      },
      summarize: (output) => {
        const acc = output as Account;
        return TOOL_MESSAGES.ACCOUNTS.CREATED(acc.name, acc.type);
      },
    }),
    defineTool({
      name: AgentToolName.ACCOUNTS_RENAME,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ACCOUNTS_RENAME],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.ACCOUNTS_RENAME],
      invalidates: [ToolInvalidationTag.ACCOUNTS],
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
      name: AgentToolName.ACCOUNTS_UPDATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ACCOUNTS_UPDATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.ACCOUNTS_UPDATE],
      invalidates: [ToolInvalidationTag.ACCOUNTS, ToolInvalidationTag.ANALYTICS],
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
        const rows: [string, string][] = [[ConfirmationRowLabel.ACCOUNT_ID, input.accountId]];
        if (input.name !== undefined) rows.push([ConfirmationRowLabel.NAME, input.name]);
        if (input.balance !== undefined)
          rows.push([ConfirmationRowLabel.BALANCE, formatINR(input.balance)]);
        if (input.isDefault === true) rows.push([ConfirmationRowLabel.SET_AS_DEFAULT, "Yes"]);
        return {
          type: AgentCardType.CONFIRMATION,
          title: AGENT_TOOL_TITLES[AgentToolName.ACCOUNTS_UPDATE],
          rows,
        };
      },
      summarize: (output) => `Updated account ${(output as Account).name}`,
    }),
    defineTool({
      name: AgentToolName.ACCOUNTS_DELETE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.ACCOUNTS_DELETE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.ACCOUNTS_DELETE],
      invalidates: [ToolInvalidationTag.ACCOUNTS, ToolInvalidationTag.ANALYTICS],
      schema: z.object({
        accountId: z.string().uuid("Invalid account ID"),
      }),
      execute: async (input, ctx) => accountsService.remove(input.accountId, ctx.userId),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.ACCOUNTS_DELETE],
        rows: [
          [ConfirmationRowLabel.ACCOUNT_ID, input.accountId],
          [ConfirmationRowLabel.EFFECT, "The account will be deactivated (soft delete)"],
        ],
      }),
      summarize: () => "Account removed",
    }),
  ];
}
