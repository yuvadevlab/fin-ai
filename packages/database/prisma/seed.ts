/**
 * @finai/database — Seed Script
 *
 * Idempotent: uses upsert/createMany with skipDuplicates.
 * Safe to run multiple times — NEVER drops or truncates existing data.
 *
 * Usage (run manually from project root):
 *   pnpm --filter @finai/database db:seed
 */

import { PrismaClient } from "@prisma/client";
import { Logger } from "@finai/logger";

const prisma = new PrismaClient();
const logger = new Logger("DatabaseSeed");

// ---------------------------------------------------------------------------
// Menu Items
// Seeded with group names "OVERVIEW" and "INTELLIGENCE" to match the Sidebar
// component's filter logic in packages/ui/src/layouts/Sidebar.tsx.
// ---------------------------------------------------------------------------
const MENU_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    group: "OVERVIEW",
    order: 0,
    isActive: true,
  },
  {
    label: "Accounts",
    href: "/accounts",
    icon: "Wallet",
    group: "OVERVIEW",
    order: 10,
    isActive: true,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: "ArrowLeftRight",
    group: "OVERVIEW",
    order: 20,
    isActive: true,
  },
  {
    label: "Budgets",
    href: "/budgets",
    icon: "PiggyBank",
    group: "OVERVIEW",
    order: 30,
    isActive: true,
  },
  { label: "Goals", href: "/goals", icon: "Target", group: "OVERVIEW", order: 40, isActive: true },
  {
    label: "Investments",
    href: "/investments",
    icon: "TrendingUp",
    group: "OVERVIEW",
    order: 50,
    isActive: true,
  },
  {
    label: "Financial Health",
    href: "/health",
    icon: "HeartPulse",
    group: "OVERVIEW",
    order: 60,
    isActive: true,
  },
  {
    label: "Categories",
    href: "/categories",
    icon: "Tag",
    group: "OVERVIEW",
    order: 70,
    isActive: true,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "FileBarChart",
    group: "OVERVIEW",
    order: 80,
    isActive: true,
  },
  {
    label: "AI Advisor",
    href: "/ai-advisor",
    icon: "Sparkles",
    group: "INTELLIGENCE",
    order: 90,
    isActive: true,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "Settings",
    group: "INTELLIGENCE",
    order: 100,
    isActive: true,
  },
];

async function seedMenuItems() {
  logger.info("🌱 Seeding menu items...");
  let upserted = 0;
  for (const item of MENU_ITEMS) {
    await prisma.menuItem.upsert({
      where: { href: item.href },
      update: {
        label: item.label,
        icon: item.icon,
        group: item.group,
        order: item.order,
        isActive: item.isActive,
      },
      create: item,
    });
    upserted++;
  }
  logger.info(`   ✔ ${upserted} menu items upserted.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  logger.info("🚀 FinAI Database Seed — starting");

  await seedMenuItems();

  logger.info("✅ Seed complete.");
}

main()
  .catch((err) => {
    logger.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
