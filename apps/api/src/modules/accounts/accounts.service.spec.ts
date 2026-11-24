import { Test, TestingModule } from "@nestjs/testing";
import { AccountsService } from "./accounts.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { AccountType } from "@fin-ai/shared-types";

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
          count: vi.fn().mockResolvedValue(1),
        },
        user: {
          findUnique: vi.fn().mockResolvedValue({ preferences: {} }),
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
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        orderBy: { name: "asc" },
      });
      expect(result).toEqual([
        { id: "1", name: "Savings", userId: "user1", isDefault: true },
        { id: "2", name: "Checking", userId: "user1", isDefault: false },
      ]);
    });

    it("should prefer 1st account of type BANK when no explicit default preference is set", async () => {
      const mockAccounts = [
        { id: "1", name: "Credit Card", type: AccountType.CREDIT_CARD, userId: "user1" },
        { id: "2", name: "HDFC Salary", type: AccountType.BANK, userId: "user1" },
        { id: "3", name: "SBI Savings", type: AccountType.BANK, userId: "user1" },
      ];
      (prismaMock.client.account.findMany as Mock).mockResolvedValue(mockAccounts);

      const result = await service.findAll("user1");

      expect(result).toEqual([
        {
          id: "1",
          name: "Credit Card",
          type: AccountType.CREDIT_CARD,
          userId: "user1",
          isDefault: false,
        },
        { id: "2", name: "HDFC Salary", type: AccountType.BANK, userId: "user1", isDefault: true },
        { id: "3", name: "SBI Savings", type: AccountType.BANK, userId: "user1", isDefault: false },
      ]);
    });

    it("should fall back to accounts[0] when no BANK account exists", async () => {
      const mockAccounts = [
        { id: "1", name: "Cash Wallet", type: AccountType.CASH, userId: "user1" },
        { id: "2", name: "Credit Card", type: AccountType.CREDIT_CARD, userId: "user1" },
      ];
      (prismaMock.client.account.findMany as Mock).mockResolvedValue(mockAccounts);

      const result = await service.findAll("user1");

      expect(result).toEqual([
        { id: "1", name: "Cash Wallet", type: AccountType.CASH, userId: "user1", isDefault: true },
        {
          id: "2",
          name: "Credit Card",
          type: AccountType.CREDIT_CARD,
          userId: "user1",
          isDefault: false,
        },
      ]);
    });

    it("should respect explicit default account preference", async () => {
      const mockAccounts = [
        { id: "1", name: "Savings", userId: "user1" },
        { id: "2", name: "Checking", userId: "user1" },
      ];
      (prismaMock.client.account.findMany as Mock).mockResolvedValue(mockAccounts);
      (prismaMock.client.user.findUnique as Mock).mockResolvedValue({
        preferences: { defaultAccountId: "2" },
      });

      const result = await service.findAll("user1");

      expect(result).toEqual([
        { id: "1", name: "Savings", userId: "user1", isDefault: false },
        { id: "2", name: "Checking", userId: "user1", isDefault: true },
      ]);
    });

    it("should return empty array when user has no accounts", async () => {
      (prismaMock.client.account.findMany as Mock).mockResolvedValue([]);
      const result = await service.findAll("user1");
      expect(result).toEqual([]);
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
