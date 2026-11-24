import { describe, it, expect, vi } from "vitest";
import { createWorkspacesTools } from "./workspaces.tools";
import { AgentToolName, WorkspaceRole, WorkspaceType } from "@fin-ai/shared-types";
import type { AgentContext } from "../../agent.types";
import type { WorkspacesService } from "@/modules/workspaces/services/workspaces.service";
import type { WorkspacesInvitationsService } from "@/modules/workspaces/services/workspaces-invitations.service";
import type { WorkspacesMembersService } from "@/modules/workspaces/services/workspaces-members.service";

describe("WorkspacesTools", () => {
  const mockWorkspacesService = {
    getUserWorkspaces: vi.fn(),
    getWorkspace: vi.fn(),
  } as unknown as WorkspacesService;

  const mockInvitationsService = {
    listMyPendingInvitations: vi.fn(),
    sendInvitation: vi.fn(),
  } as unknown as WorkspacesInvitationsService;

  const mockMembersService = {
    listMembers: vi.fn(),
  } as unknown as WorkspacesMembersService;

  const tools = createWorkspacesTools({
    workspacesService: mockWorkspacesService,
    invitationsService: mockInvitationsService,
    membersService: mockMembersService,
  });

  const ctx: AgentContext = {
    userId: "user-123",
    conversationId: "conv-1",
    runId: "run-1",
    workspaceId: "ws-current",
    isWorkspaceReadOnly: false,
  };

  it("should register all expected workspace tools", () => {
    const names = tools.map((t) => t.name);
    expect(names).toContain(AgentToolName.WORKSPACES_LIST);
    expect(names).toContain(AgentToolName.WORKSPACES_GET);
    expect(names).toContain(AgentToolName.WORKSPACES_MEMBERS_LIST);
    expect(names).toContain(AgentToolName.WORKSPACES_INVITATIONS_LIST);
    expect(names).toContain(AgentToolName.WORKSPACES_INVITATIONS_SEND);
  });

  it("workspaces.list should retrieve workspaces and flag active workspace", async () => {
    const listTool = tools.find((t) => t.name === AgentToolName.WORKSPACES_LIST)!;
    vi.mocked(mockWorkspacesService.getUserWorkspaces).mockResolvedValueOnce([
      {
        id: "ws-current",
        name: "Personal Workspace",
        type: WorkspaceType.PERSONAL,
        role: WorkspaceRole.OWNER,
        memberCount: 1,
      },
      {
        id: "ws-other",
        name: "Sharma Family",
        type: WorkspaceType.SHARED,
        role: WorkspaceRole.MEMBER,
        memberCount: 3,
      },
    ] as never);

    const res = (await listTool.execute({}, ctx)) as {
      workspaces: Array<{ id: string; isActive: boolean }>;
    };
    expect(res.workspaces).toHaveLength(2);
    expect(res.workspaces[0].isActive).toBe(true);
    expect(res.workspaces[1].isActive).toBe(false);
  });

  it("workspaces.invitations.send should validate and dispatch invitation", async () => {
    const sendTool = tools.find((t) => t.name === AgentToolName.WORKSPACES_INVITATIONS_SEND)!;
    vi.mocked(mockInvitationsService.sendInvitation).mockResolvedValueOnce({
      id: "inv-1",
      email: "collab@example.com",
      role: WorkspaceRole.MEMBER,
    } as never);

    const res = (await sendTool.execute(
      { email: "collab@example.com", role: WorkspaceRole.MEMBER },
      ctx,
    )) as { id: string };
    expect(mockInvitationsService.sendInvitation).toHaveBeenCalledWith(
      "ws-current",
      "user-123",
      expect.objectContaining({ email: "collab@example.com", role: WorkspaceRole.MEMBER }),
    );
    expect(res.id).toBe("inv-1");
  });
});
