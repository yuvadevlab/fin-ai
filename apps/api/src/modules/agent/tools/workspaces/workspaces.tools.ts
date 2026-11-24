import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { WorkspacesService } from "@/modules/workspaces/services/workspaces.service";
import type { WorkspacesInvitationsService } from "@/modules/workspaces/services/workspaces-invitations.service";
import type { WorkspacesMembersService } from "@/modules/workspaces/services/workspaces-members.service";
import {
  AgentCardType,
  AgentToolName,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
  WorkspaceRole,
} from "@fin-ai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@fin-ai/ai-engine";

export interface WorkspacesToolsDeps {
  workspacesService: WorkspacesService;
  invitationsService: WorkspacesInvitationsService;
  membersService: WorkspacesMembersService;
}

export function createWorkspacesTools(deps: WorkspacesToolsDeps) {
  const { workspacesService, invitationsService, membersService } = deps;

  return [
    defineTool({
      name: AgentToolName.WORKSPACES_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.WORKSPACES_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.WORKSPACES_LIST],
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const workspaces = await workspacesService.getUserWorkspaces(ctx.userId);
        return {
          workspaces: workspaces.map((ws) => ({
            id: ws.id,
            name: ws.name,
            type: ws.type,
            role: ws.role,
            memberCount: ws.memberCount,
            isActive: ws.id === ctx.workspaceId,
          })),
        };
      },
      summarize: (output) => {
        const { workspaces } = output as { workspaces: Array<{ name: string }> };
        return `Retrieved ${workspaces.length} workspace(s)`;
      },
    }),

    defineTool({
      name: AgentToolName.WORKSPACES_GET,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.WORKSPACES_GET],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.WORKSPACES_GET],
      schema: z.object({
        workspaceId: z.string().uuid().optional(),
      }),
      execute: async (input, ctx) => {
        const targetId = input.workspaceId ?? ctx.workspaceId;
        return workspacesService.getWorkspace(targetId, ctx.userId);
      },
      summarize: (output) => {
        const ws = output as { name: string; role: string };
        return `Workspace: "${ws.name}" (${ws.role})`;
      },
    }),

    defineTool({
      name: AgentToolName.WORKSPACES_MEMBERS_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.WORKSPACES_MEMBERS_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.WORKSPACES_MEMBERS_LIST],
      schema: z.object({
        workspaceId: z.string().uuid().optional(),
      }),
      execute: async (input, ctx) => {
        const targetId = input.workspaceId ?? ctx.workspaceId;
        const members = await membersService.listMembers(targetId, ctx.userId);
        return { members };
      },
      summarize: (output) => {
        const { members } = output as { members: Array<{ user: { name: string } }> };
        return `Found ${members.length} workspace member(s)`;
      },
    }),

    defineTool({
      name: AgentToolName.WORKSPACES_INVITATIONS_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.WORKSPACES_INVITATIONS_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.WORKSPACES_INVITATIONS_LIST],
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const invitations = await invitationsService.listMyPendingInvitations(ctx.userId);
        return { invitations };
      },
      summarize: (output) => {
        const { invitations } = output as { invitations: Array<{ workspace: { name: string } }> };
        return `Found ${invitations.length} pending workspace invitation(s)`;
      },
    }),

    defineTool({
      name: AgentToolName.WORKSPACES_INVITATIONS_SEND,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.WORKSPACES_INVITATIONS_SEND],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.WORKSPACES_INVITATIONS_SEND],
      invalidates: [ToolInvalidationTag.WORKSPACES],
      schema: z.object({
        email: z.string().email(),
        role: z.enum([WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]).default(WorkspaceRole.MEMBER),
        workspaceId: z.string().uuid().optional(),
      }),
      execute: async (input, ctx) => {
        const targetWorkspaceId = input.workspaceId ?? ctx.workspaceId;
        return invitationsService.sendInvitation(targetWorkspaceId, ctx.userId, {
          email: input.email,
          role: input.role,
        });
      },
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title:
          AGENT_TOOL_TITLES[AgentToolName.WORKSPACES_INVITATIONS_SEND] ??
          "Send workspace invitation",
        rows: [
          [ConfirmationRowLabel.EMAIL, input.email],
          ["Role", input.role ?? WorkspaceRole.MEMBER],
        ],
      }),
      summarize: (output) => {
        const inv = output as { email: string; role: string };
        return `Sent workspace invitation to ${inv.email} (${inv.role})`;
      },
    }),
  ];
}
