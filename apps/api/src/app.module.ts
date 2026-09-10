import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { GoalsModule } from "./modules/goals/goals.module";
import { InvestmentsModule } from "./modules/investments/investments.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AiModule } from "./modules/ai/ai.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { SearchModule } from "./modules/search/search.module";
import { MenuItemsModule } from "./modules/menu-items/menu-items.module";
import { AgentModule } from "./modules/agent/agent.module";
import { OptionsModule } from "./modules/options/options.module";

import { AppController } from "./app.controller";

/**
 * Root NestJS application module.
 *
 * Wires together all infrastructure (ConfigModule, PrismaModule, ThrottlerModule)
 * and feature modules (Auth, Accounts, Transactions, Budgets, Goals, Investments,
 * Analytics, AI, Categories, Search, MenuItems, Agent).
 *
 * Rate-limiting uses two buckets:
 * - "default": 60 req/min (applied selectively via @Throttle on SSE/agent endpoints)
 * - "agent": 15 req/min (stricter bucket for agentic endpoints)
 */
@Module({
  controllers: [AppController],
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    // Infrastructure
    PrismaModule,
    // Rate limiting (applied explicitly on the agent/SSE endpoints)
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60_000,
        limit: 60,
      },
      {
        name: "agent",
        ttl: 60_000,
        limit: 15,
      },
    ]),
    // Feature modules
    AuthModule,
    AccountsModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    InvestmentsModule,
    AnalyticsModule,
    AiModule,
    CategoriesModule,
    SearchModule,
    MenuItemsModule,
    AgentModule,
    OptionsModule,
  ],
})
export class AppModule {}
