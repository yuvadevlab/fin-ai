/**
 * @file packages/shared-types/src/workspace.enums.ts
 * @description Canonical enums for FinAI workspaces, roles, and invitations.
 * @module @finai/shared-types/workspace.enums
 */

export const WorkspaceType = {
  PERSONAL: "PERSONAL",
  FAMILY: "FAMILY",
} as const;
export type WorkspaceType = (typeof WorkspaceType)[keyof typeof WorkspaceType];

export const WorkspaceRole = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
} as const;
export type WorkspaceRole = (typeof WorkspaceRole)[keyof typeof WorkspaceRole];

export const InvitationStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type InvitationStatus = (typeof InvitationStatus)[keyof typeof InvitationStatus];

export const InvitationAction = {
  ACCEPT: "accept",
  REJECT: "reject",
} as const;
export type InvitationAction = (typeof InvitationAction)[keyof typeof InvitationAction];
