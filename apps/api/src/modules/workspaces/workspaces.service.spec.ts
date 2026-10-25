import { Test, TestingModule } from "@nestjs/testing";
import { WorkspacesService } from "./services/workspaces.service";
import { WorkspacesRepository } from "./repositories/workspaces.repository";
import { BadRequestException } from "@nestjs/common";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { WorkspaceType } from "@finai/database";

describe("WorkspacesService", () => {
  let service: WorkspacesService;
  let repoMock: Partial<Record<keyof WorkspacesRepository, Mock>>;

  beforeEach(async () => {
    repoMock = {
      findPersonalWorkspace: vi.fn(),
      createPersonalWorkspace: vi.fn(),
      findUserWorkspaces: vi.fn(),
      findById: vi.fn(),
      createWorkspace: vi.fn(),
      updateWorkspace: vi.fn(),
      deleteWorkspace: vi.fn(),
      findMember: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: WorkspacesRepository,
          useValue: repoMock,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  describe("getOrCreatePersonalWorkspace", () => {
    it("should return existing personal workspace if present", async () => {
      const mockWorkspace = {
        id: "ws-1",
        name: "Personal Workspace",
        type: WorkspaceType.PERSONAL,
        ownerId: "user-1",
      };
      repoMock.findPersonalWorkspace!.mockResolvedValue(mockWorkspace);

      const result = await service.getOrCreatePersonalWorkspace("user-1");
      expect(result).toEqual(mockWorkspace);
      expect(repoMock.createPersonalWorkspace).not.toHaveBeenCalled();
    });

    it("should auto-provision personal workspace if none exists", async () => {
      repoMock.findPersonalWorkspace!.mockResolvedValue(null);
      const createdWorkspace = {
        id: "ws-new",
        name: "Yuva's Workspace",
        type: WorkspaceType.PERSONAL,
        ownerId: "user-1",
      };
      repoMock.createPersonalWorkspace!.mockResolvedValue(createdWorkspace);

      const result = await service.getOrCreatePersonalWorkspace("user-1", "Yuva");
      expect(result).toEqual(createdWorkspace);
      expect(repoMock.createPersonalWorkspace).toHaveBeenCalledWith("user-1", "Yuva");
    });
  });

  describe("deleteWorkspace", () => {
    it("should reject deletion of personal workspaces", async () => {
      const personalWs = {
        id: "ws-p",
        name: "Personal",
        type: WorkspaceType.PERSONAL,
        ownerId: "user-1",
      };
      repoMock.findById!.mockResolvedValue(personalWs);

      await expect(service.deleteWorkspace("ws-p", "user-1")).rejects.toThrow(BadRequestException);
    });
  });
});
