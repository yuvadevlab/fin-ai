/* eslint-disable no-console */
import "dotenv/config";
import { PrismaClient, WorkspaceType, WorkspaceRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/finai";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning up database...");
  await prisma.menuItem.deleteMany();
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

  console.log("Seeding menu items...");
  await prisma.menuItem.createMany({
    data: [
      {
        label: "Dashboard",
        href: "/",
        icon: "LayoutDashboard",
        group: "OVERVIEW",
        order: 1,
        isActive: true,
      },
      {
        label: "Transactions",
        href: "/transactions",
        icon: "ArrowLeftRight",
        group: "OVERVIEW",
        order: 2,
        isActive: true,
      },
      {
        label: "Accounts",
        href: "/accounts",
        icon: "Wallet",
        group: "OVERVIEW",
        order: 3,
        isActive: true,
      },
      {
        label: "Categories",
        href: "/categories",
        icon: "Tag",
        group: "OVERVIEW",
        order: 4,
        isActive: true,
      },
      {
        label: "Budgets",
        href: "/budgets",
        icon: "PiggyBank",
        group: "OVERVIEW",
        order: 5,
        isActive: true,
      },
      {
        label: "Goals",
        href: "/goals",
        icon: "Target",
        group: "OVERVIEW",
        order: 6,
        isActive: true,
      },
      {
        label: "Investments",
        href: "/investments",
        icon: "TrendingUp",
        group: "OVERVIEW",
        order: 7,
        isActive: true,
      },
      {
        label: "Reports",
        href: "/reports",
        icon: "FileBarChart",
        group: "OVERVIEW",
        order: 8,
        isActive: true,
      },
      {
        label: "Family",
        href: "/family",
        icon: "Users",
        group: "OVERVIEW",
        order: 9,
        isActive: true,
      },
      {
        label: "Financial Health",
        href: "/health",
        icon: "HeartPulse",
        group: "OVERVIEW",
        order: 10,
        isActive: true,
      },
      {
        label: "AI Advisor",
        href: "/ai-advisor",
        icon: "Sparkles",
        group: "INTELLIGENCE",
        order: 11,
        isActive: true,
      },
      {
        label: "Settings",
        href: "/settings",
        icon: "Settings",
        group: "INTELLIGENCE",
        order: 12,
        isActive: true,
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
