import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./modules/prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { BudgetsModule } from "./modules/budgets/budgets.module";
import { GoalsModule } from "./modules/goals/goals.module";
import { InvestmentsModule } from "./modules/investments/investments.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AiModule } from "./modules/ai/ai.module";
import { WorkspacesModule } from "./modules/workspaces/workspaces.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { SearchModule } from "./modules/search/search.module";
import { MenuItemsModule } from "./modules/menu-items/menu-items.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    // Infrastructure
    PrismaModule,
    // Feature modules
    AuthModule,
    AccountsModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    InvestmentsModule,
    AnalyticsModule,
    AiModule,
    WorkspacesModule,
    CategoriesModule,
    SearchModule,
    MenuItemsModule,
  ],
})
export class AppModule {}
