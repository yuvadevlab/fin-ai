/* eslint-disable no-console */
import "dotenv/config";
import {
  PrismaClient,
  WorkspaceType,
  WorkspaceRole,
  AccountType,
  TransactionType,
  BudgetPeriod,
  AssetClass,
  Category,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/finai";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up database...");
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding base user...");
  const user = await prisma.user.create({
    data: {
      email: "finai.user@gmail.com",
      name: "FinAI User",
      // Pre-hashed "FinAI#1234!" using bcrypt
      passwordHash: "$2b$10$g/5An7UmkRH/UwPQ/TplMObWJCO2/L5lGSmoOXZWYGWL2zyl1GePq",
      avatarUrl: null,
    },
  });

  console.log("Seeding workspaces...");
  const personalWorkspace = await prisma.workspace.create({
    data: {
      name: "FinAI Personal Workspace",
      type: WorkspaceType.PERSONAL,
      ownerId: user.id,
    },
  });

  const familyWorkspace = await prisma.workspace.create({
    data: {
      name: "FinAI Family Workspace",
      type: WorkspaceType.FAMILY,
      ownerId: user.id,
    },
  });

  await prisma.workspaceMember.createMany({
    data: [
      {
        workspaceId: personalWorkspace.id,
        userId: user.id,
        role: WorkspaceRole.OWNER,
      },
      {
        workspaceId: familyWorkspace.id,
        userId: user.id,
        role: WorkspaceRole.OWNER,
      },
    ],
  });

  console.log("Seeding accounts...");
  const hdfcSalary = await prisma.account.create({
    data: {
      workspaceId: personalWorkspace.id,
      name: "HDFC Salary",
      type: AccountType.BANK,
      balance: 214500,
    },
  });

  const iciciSavings = await prisma.account.create({
    data: {
      workspaceId: personalWorkspace.id,
      name: "ICICI Savings",
      type: AccountType.BANK,
      balance: 342800,
    },
  });

  const hdfcCredit = await prisma.account.create({
    data: {
      workspaceId: personalWorkspace.id,
      name: "HDFC Credit",
      type: AccountType.CREDIT_CARD,
      balance: -18240,
    },
  });

  const paytmWallet = await prisma.account.create({
    data: {
      workspaceId: personalWorkspace.id,
      name: "Paytm Wallet",
      type: AccountType.WALLET,
      balance: 4200,
    },
  });

  await prisma.account.create({
    data: {
      workspaceId: personalWorkspace.id,
      name: "Cash",
      type: AccountType.CASH,
      balance: 6500,
    },
  });

  const jointAccount = await prisma.account.create({
    data: {
      workspaceId: familyWorkspace.id,
      name: "Joint Account",
      type: AccountType.BANK,
      balance: 128200,
    },
  });

  console.log("Seeding categories...");
  // Standard categories
  const categoriesData = [
    { name: "Income", group: "Income", icon: "trending-up" },
    { name: "Housing", group: "Fixed Expenses", icon: "home" },
    { name: "Groceries", group: "Variable Expenses", icon: "shopping-cart" },
    { name: "Lifestyle", group: "Variable Expenses", icon: "smile" },
    { name: "Transport", group: "Variable Expenses", icon: "car" },
    { name: "Utilities", group: "Fixed Expenses", icon: "zap" },
    { name: "Food & Dining", group: "Variable Expenses", icon: "coffee" },
    { name: "Shopping", group: "Variable Expenses", icon: "shopping-bag" },
    { name: "Entertainment", group: "Variable Expenses", icon: "film" },
    { name: "Investment", group: "Savings & Investments", icon: "trending-up" },
  ];

  const personalCategories: Category[] = [];
  const familyCategories: Category[] = [];

  for (const cat of categoriesData) {
    personalCategories.push(
      await prisma.category.create({
        data: {
          workspaceId: personalWorkspace.id,
          name: cat.name,
          group: cat.group,
          icon: cat.icon,
          isSystem: true,
        },
      }),
    );

    familyCategories.push(
      await prisma.category.create({
        data: {
          workspaceId: familyWorkspace.id,
          name: cat.name,
          group: cat.group,
          icon: cat.icon,
          isSystem: true,
        },
      }),
    );
  }

  const getPersonalCategory = (name: string) => {
    const c = personalCategories.find((x) => x.name === name);
    if (!c) throw new Error(`Category ${name} not found in personal workspace`);
    return c;
  };

  const getFamilyCategory = (name: string) => {
    const c = familyCategories.find((x) => x.name === name);
    if (!c) throw new Error(`Category ${name} not found in family workspace`);
    return c;
  };

  console.log("Seeding transactions...");
  await prisma.transaction.createMany({
    data: [
      {
        workspaceId: personalWorkspace.id,
        accountId: hdfcCredit.id,
        categoryId: getPersonalCategory("Food & Dining").id,
        amount: -840,
        date: new Date("2026-03-08"),
        type: TransactionType.EXPENSE,
      },
      {
        workspaceId: personalWorkspace.id,
        accountId: hdfcSalary.id,
        categoryId: getPersonalCategory("Income").id,
        amount: 125000,
        date: new Date("2026-03-07"),
        type: TransactionType.INCOME,
      },
      {
        workspaceId: familyWorkspace.id,
        accountId: jointAccount.id,
        categoryId: getFamilyCategory("Groceries").id,
        amount: -3240,
        date: new Date("2026-03-06"),
        type: TransactionType.EXPENSE,
      },
      {
        workspaceId: personalWorkspace.id,
        accountId: paytmWallet.id,
        categoryId: getPersonalCategory("Transport").id,
        amount: -420,
        date: new Date("2026-03-05"),
        type: TransactionType.EXPENSE,
      },
      {
        workspaceId: familyWorkspace.id,
        accountId: jointAccount.id,
        categoryId: getFamilyCategory("Utilities").id,
        amount: -1180,
        date: new Date("2026-03-04"),
        type: TransactionType.EXPENSE,
      },
      {
        workspaceId: personalWorkspace.id,
        accountId: hdfcCredit.id,
        categoryId: getPersonalCategory("Shopping").id,
        amount: -2450,
        date: new Date("2026-03-03"),
        type: TransactionType.EXPENSE,
      },
      {
        workspaceId: personalWorkspace.id,
        accountId: iciciSavings.id,
        categoryId: getPersonalCategory("Investment").id,
        amount: -15000,
        date: new Date("2026-03-02"),
        type: TransactionType.INVESTMENT,
      },
      {
        workspaceId: familyWorkspace.id,
        accountId: jointAccount.id,
        categoryId: getFamilyCategory("Housing").id,
        amount: -32000,
        date: new Date("2026-03-01"),
        type: TransactionType.EXPENSE,
      },
    ],
  });

  console.log("Seeding budgets...");
  const budgetList = [
    { name: "Food & Dining", limit: 10000 },
    { name: "Groceries", limit: 15000 },
    { name: "Transport", limit: 5000 },
    { name: "Entertainment", limit: 6000 },
    { name: "Shopping", limit: 8000 },
    { name: "Utilities", limit: 3500 },
  ];

  for (const b of budgetList) {
    await prisma.budget.create({
      data: {
        workspaceId: personalWorkspace.id,
        categoryId: getPersonalCategory(b.name).id,
        limit: b.limit,
        period: BudgetPeriod.MONTHLY,
      },
    });
  }

  console.log("Seeding goals...");
  await prisma.goal.createMany({
    data: [
      {
        workspaceId: personalWorkspace.id,
        name: "Emergency Fund",
        targetAmount: 500000,
        currentAmount: 380000,
        deadline: new Date("2026-12-31"),
        type: "PERSONAL",
      },
      {
        workspaceId: familyWorkspace.id,
        name: "Europe Vacation",
        targetAmount: 400000,
        currentAmount: 180000,
        deadline: new Date("2026-07-31"),
        type: "FAMILY",
      },
      {
        workspaceId: familyWorkspace.id,
        name: "House Down Payment",
        targetAmount: 5000000,
        currentAmount: 1250000,
        deadline: new Date("2028-12-31"),
        type: "FAMILY",
      },
      {
        workspaceId: personalWorkspace.id,
        name: "New MacBook Pro",
        targetAmount: 250000,
        currentAmount: 95000,
        deadline: new Date("2026-09-30"),
        type: "PERSONAL",
      },
      {
        workspaceId: personalWorkspace.id,
        name: "Gold Savings",
        targetAmount: 200000,
        currentAmount: 145000,
        deadline: new Date("2026-12-31"),
        type: "PERSONAL",
      },
    ],
  });

  console.log("Seeding investments...");
  await prisma.investment.createMany({
    data: [
      {
        workspaceId: personalWorkspace.id,
        name: "Mutual Funds",
        assetClass: AssetClass.MUTUAL_FUND,
        currentValue: 425000,
        investedAmount: 378000,
      },
      {
        workspaceId: personalWorkspace.id,
        name: "Stocks",
        assetClass: AssetClass.STOCK,
        currentValue: 285000,
        investedAmount: 263400,
      },
      {
        workspaceId: personalWorkspace.id,
        name: "Fixed Deposits",
        assetClass: AssetClass.FIXED_DEPOSIT,
        currentValue: 180000,
        investedAmount: 180000,
      },
      {
        workspaceId: personalWorkspace.id,
        name: "Gold",
        assetClass: AssetClass.GOLD,
        currentValue: 145000,
        investedAmount: 138300,
      },
      {
        workspaceId: personalWorkspace.id,
        name: "EPF",
        assetClass: AssetClass.EPF,
        currentValue: 62000,
        investedAmount: 62000,
      },
      {
        workspaceId: personalWorkspace.id,
        name: "PPF",
        assetClass: AssetClass.PPF,
        currentValue: 38000,
        investedAmount: 38000,
      },
    ],
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
