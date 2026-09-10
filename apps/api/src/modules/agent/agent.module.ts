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
import { ActionManager } from "./action-manager";
import { AuditService } from "./audit.service";
import { ToolRegistry } from "./tool-registry";
import { EntityMemoryService } from "./entity-memory";

/**
 * AgentModule wires the full agent stack: HTTP transport (controller), the
 * decision loop (AgentService), two-phase writes (AgentActionService +
 * AuditService), the tool catalog (ToolRegistry), and follow-up context
 * (EntityMemoryService). Domain modules are imported so their services can
 * be adapted into tools — the agent has no business logic of its own beyond
 * orchestration and safety gating.
 */
/**
 * NestJS wiring for the agent module. Domain modules are imported so their
 * services can be injected into tool factories (the LLM only ever reaches
 * data through those services). AgentService orchestrates the model loop;
 * AgentActionService implements the propose/confirm two-phase execution for
 * confirmation-gated writes.
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
    ActionManager,
    AuditService,
    ToolRegistry,
    EntityMemoryService,
  ],
})
export class AgentModule {}
