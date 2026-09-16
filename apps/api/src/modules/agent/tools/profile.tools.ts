import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { UsersService } from "@/modules/auth/users.service";
import type { AccountsService } from "@/modules/accounts/accounts.service";
import type { User } from "@finai/shared-types";
import { updateProfileSchema } from "@finai/validation";

/**
 * Read + write tools over the existing UsersService and account
 * preferences. Profile updates include email — hence the required
 * confirmation even though it's "just" profile data.
 */
export function createProfileTools(usersService: UsersService, accountsService: AccountsService) {
  return [
    defineTool({
      name: "profile.get",
      description:
        "Get the current user's profile: id, email, name, avatar URL, and preferences (appearance, notifications, security, default account).",
      access: "read",
      confirmation: "none",
      label: "Loading your profile",
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
      name: "profile.update",
      description:
        "Update the user's own profile: display name, email, or preference sections (appearance, notifications, security). Requires confirmation. Only pass the fields that should change.",
      access: "write",
      confirmation: "required",
      label: "Updating your profile",
      invalidates: ["user-profile", "accounts"],
      schema: updateProfileSchema,
      execute: async (input, ctx) => usersService.updateProfile(ctx.userId, input),
      describe: (input) => {
        const rows: [string, string][] = [];
        if (input.name !== undefined) rows.push(["Name", input.name]);
        if (input.email !== undefined) rows.push(["Email", input.email]);
        if (input.preferences !== undefined)
          rows.push(["Preferences", JSON.stringify(input.preferences)]);
        return { type: "confirmation" as const, title: "Update profile", rows };
      },
      summarize: (output) => {
        const user = output as User;
        return `Profile updated for ${user.name}`;
      },
    }),
    defineTool({
      name: "profile.setDefaultAccount",
      description:
        "Set which of the user's FinAI accounts is the default account. Requires confirmation. Resolve the account ID with accounts.list first.",
      access: "write",
      confirmation: "required",
      label: "Setting default account",
      invalidates: ["user-profile", "accounts"],
      schema: z.object({
        accountId: z.string().uuid("Invalid account ID"),
      }),
      execute: async (input, ctx) => accountsService.setDefault(input.accountId, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Set default account",
        rows: [["Account ID", input.accountId]],
      }),
      summarize: () => "Default account updated",
    }),
  ];
}
