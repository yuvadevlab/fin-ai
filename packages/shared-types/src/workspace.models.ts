/**
 * @file packages/shared-types/src/workspace.models.ts
 * @description Interface contracts for workspaces, members, and invitations.
 * @module @finai/shared-types/workspace.models
 */

import type { User } from "./models";
import type { InvitationStatus, WorkspaceRole, WorkspaceType } from "./workspace.enums";

export interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: WorkspaceMember[];
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  inviterId: string;
  inviteeId: string;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
  workspace?: Workspace;
  inviter?: User;
  invitee?: User;
}

export interface WorkspaceWithRole extends Workspace {
  role: WorkspaceRole;
  memberCount: number;
}
