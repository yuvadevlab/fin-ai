import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { UsersService } from "@/modules/auth/users.service";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { User } from "@finai/shared-types";
import {
  AgentToolName,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@finai/ai-engine";
import { updateProfileSchema } from "@finai/validation";

const INVALIDATES_PROFILE_WRITES = [ToolInvalidationTag.USER_PROFILE, ToolInvalidationTag.ACCOUNTS];

/**
 * Read + write tools over the existing UsersService and account
 * preferences. Profile updates include email — hence the required
 * confirmation even though it's "just" profile data.
 */
export function createProfileTools(usersService: UsersService, accountsService: AccountsService) {
  return [
    defineTool({
      name: AgentToolName.PROFILE_GET,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.PROFILE_GET],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.PROFILE_GET],
      schema: z.object({}),
      execute: async (_input, ctx) => usersService.getProfile(ctx.userId),
      serialize: (output) => {
        const user = output as User & { preferences?: unknown };
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          preferences: user.preferences ?? {},
        };
      },
      summarize: (output) => {
        const user = output as User;
        return `Profile for ${user.name} (${user.email})`;
      },
    }),
    defineTool({
      name: AgentToolName.PROFILE_UPDATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.PROFILE_UPDATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.PROFILE_UPDATE],
      invalidates: INVALIDATES_PROFILE_WRITES,
      schema: updateProfileSchema,
      execute: async (input, ctx) => usersService.updateProfile(ctx.userId, input),
      describe: (input) => {
        const rows: [string, string][] = [];
        if (input.name !== undefined) rows.push([ConfirmationRowLabel.NAME, input.name]);
        if (input.email !== undefined) rows.push([ConfirmationRowLabel.EMAIL, input.email]);
        if (input.preferences !== undefined)
          rows.push([ConfirmationRowLabel.PREFERENCES, JSON.stringify(input.preferences)]);
        return {
          type: "confirmation" as const,
          title: AGENT_TOOL_TITLES[AgentToolName.PROFILE_UPDATE],
          rows,
        };
      },
      summarize: (output) => {
        const user = output as User;
        return `Profile updated for ${user.name}`;
      },
    }),
    defineTool({
      name: AgentToolName.PROFILE_SET_DEFAULT_ACCOUNT,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.PROFILE_SET_DEFAULT_ACCOUNT],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.PROFILE_SET_DEFAULT_ACCOUNT],
      invalidates: INVALIDATES_PROFILE_WRITES,
      schema: z.object({
        accountId: z.string().uuid("Invalid account ID"),
      }),
      execute: async (input, ctx) => accountsService.setDefault(input.accountId, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: AGENT_TOOL_TITLES[AgentToolName.PROFILE_SET_DEFAULT_ACCOUNT],
        rows: [[ConfirmationRowLabel.ACCOUNT_ID, input.accountId]],
      }),
      summarize: () => "Default account updated",
    }),
  ];
}
