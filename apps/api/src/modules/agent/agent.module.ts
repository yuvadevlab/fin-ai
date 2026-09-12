import { Module } from "@nestjs/common";
import { AccountsModule } from "@/modules/accounts/accounts.module";
import { AnalyticsModule } from "@/modules/analytics/analytics.module";
import { AiModule } from "@/modules/ai/ai.module";
import { SearchModule } from "@/modules/search/search.module";
import { TransactionsModule } from "@/modules/transactions/transactions.module";
import { CategoriesModule } from "@/modules/categories/categories.module";
import { BudgetsModule } from "@/modules/budgets/budgets.module";
import { GoalsModule } from "@/modules/goals/goals.module";
import { InvestmentsModule } from "@/modules/investments/investments.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";
import { AgentActionService } from "./action.service";
import { AgentActionConfirmService } from "./agent-action-confirm.service";
import { ActionManager } from "./action-manager";
import { AuditService } from "./audit.service";
import { ToolRegistry } from "./tool-registry";
import { EntityMemoryService } from "./entity-memory";
import { AgentModelFactory, AgentOrchestratorService, AgentTurnRunner } from "./runners";
import { AgentToolDispatcher } from "./dispatchers";

/**
 * AgentModule wires the full agent stack: HTTP transport (controller), the
 * decision loop (AgentService), two-phase writes (AgentActionService + AuditService),
 * the tool catalog (ToolRegistry), entity memory, and the three extracted sub-services:
 *   - AgentModelFactory  → creates a fresh Ollama client per run
 *   - AgentTurnRunner    → streams one model turn
 *   - AgentToolDispatcher → validates, audits, and executes tool calls
 */
@Module({
  imports: [
    AccountsModule,
    AnalyticsModule,
    AiModule,
    SearchModule,
    TransactionsModule,
    CategoriesModule,
    BudgetsModule,
    GoalsModule,
    InvestmentsModule,
    AuthModule,
  ],
  controllers: [AgentController],
  providers: [
    AgentService,
    AgentActionService,
    AgentActionConfirmService,
    ActionManager,
    AuditService,
    ToolRegistry,
    EntityMemoryService,
    AgentModelFactory,
    AgentTurnRunner,
    AgentOrchestratorService,
    AgentToolDispatcher,
  ],
})
export class AgentModule {}
