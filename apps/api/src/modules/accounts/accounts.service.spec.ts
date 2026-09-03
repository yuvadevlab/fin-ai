import { Test, TestingModule } from "@nestjs/testing";
import { AccountsService } from "./accounts.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { AccountType } from "@finai/shared-types";

describe("AccountsService", () => {
  let service: AccountsService;
  let prismaMock: Partial<PrismaService>;

  beforeEach(async () => {
    // Mock PrismaService
    prismaMock = {
      client: {
        account: {
          findMany: vi.fn(),
          findFirst: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
      },
    } as unknown as Partial<PrismaService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  describe("findAll", () => {
    it("should return all active accounts for a user", async () => {
      const mockAccounts = [
        { id: "1", name: "Savings", userId: "user1" },
        { id: "2", name: "Checking", userId: "user1" },
      ];
      (prismaMock.client.account.findMany as Mock).mockResolvedValue(mockAccounts);

      const result = await service.findAll("user1");

      expect(prismaMock.client.account.findMany).toHaveBeenCalledWith({
        where: { userId: "user1", isActive: true },
        orderBy: { name: "asc" },
      });
      expect(result).toEqual(mockAccounts);
    });
  });

  describe("findOne", () => {
    it("should return an account if found", async () => {
      const mockAccount = { id: "1", name: "Savings", userId: "user1" };
      (prismaMock.client.account.findFirst as Mock).mockResolvedValue(mockAccount);

      const result = await service.findOne("1", "user1");
      expect(result).toEqual(mockAccount);
    });

    it("should throw NotFoundException if account not found", async () => {
      (prismaMock.client.account.findFirst as Mock).mockResolvedValue(null);

      await expect(service.findOne("nonexistent", "user1")).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("should create a new account", async () => {
      const input = {
        name: "New Account",
        type: "BANK" as AccountType,
        balance: 1000,
        currency: "INR",
      };
      const mockCreatedAccount = { id: "new-id", ...input, userId: "user1" };
      (prismaMock.client.account.create as Mock).mockResolvedValue(mockCreatedAccount);

      const result = await service.create("user1", input);

      expect(prismaMock.client.account.create).toHaveBeenCalledWith({
        data: {
          userId: "user1",
          name: input.name,
          type: input.type,
          balance: input.balance,
          currency: input.currency,
        },
      });
      expect(result).toEqual(mockCreatedAccount);
    });
  });
});
