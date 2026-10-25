import { z } from "zod";

/**
 * Validation schema for creating a new workspace.
 */
export const createWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
  type: z.enum(["PERSONAL", "FAMILY"]).default("FAMILY"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

/**
 * Validation schema for updating workspace metadata.
 */
export const updateWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters").max(50),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

/**
 * Validation schema for sending a member invitation.
 */
export const inviteWorkspaceMemberSchema = z.object({
  email: z.string().email("Valid email address is required"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export type InviteWorkspaceMemberInput = z.infer<typeof inviteWorkspaceMemberSchema>;

/**
 * Validation schema for updating an existing member's role.
 */
export const updateWorkspaceMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type UpdateWorkspaceMemberRoleInput = z.infer<typeof updateWorkspaceMemberRoleSchema>;
