import type { AgentCard } from "@finai/ai-engine";
import type { AgentContext, AgentTool, ConfirmationPolicy, ToolAccess } from "./agent.types";
import { AccountsService } from "@/modules/accounts/accounts.service";
import { AnalyticsService } from "@/modules/analytics/analytics.service";
import { SearchService } from "@/modules/search/search.service";
import { TransactionsService } from "@/modules/transactions/transactions.service";
import { CategoriesService } from "@/modules/categories/categories.service";
import { BudgetsService } from "@/modules/budgets/budgets.service";
import { GoalsService } from "@/modules/goals/goals.service";
import { InvestmentsService } from "@/modules/investments/investments.service";
import { UsersService } from "@/modules/auth/users.service";
import { createAccountsTools } from "./tools/accounts.tools";
import { createAnalyticsTools } from "./tools/analytics.tools";
import { createSearchTools } from "./tools/search.tools";
import { createTransactionsTools } from "./tools/transactions.tools";
import { createTransactionsWriteTools } from "./tools/transactions.write.tools";
import { createTransactionRecordTools } from "./tools/transactions.record.tools";
import { createCategoriesTools } from "./tools/categories.tools";
import { createBudgetsTools } from "./tools/budgets.tools";
import { createGoalsTools } from "./tools/goals.tools";
import { createInvestmentsTools } from "./tools/investments.tools";
import { createInsightsTools } from "./tools/insights.tools";
import { createProfileTools } from "./tools/profile.tools";
import { createActionManagementTools } from "./tools/action-management.tools";
import { ActionManager } from "./action-manager";
import { AgentActionService } from "./action.service";

// ─── Original tool definition primitives (used by all tool files) ─────────────

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ValidateContext {
  userId: string;
}

export interface DefineToolInput<T> {
  name: string;
  description: string;
  access: ToolAccess;
  confirmation: ConfirmationPolicy;
  label?: string;
  invalidates?: string[];
  schema: import("zod").ZodType<T, import("zod").ZodTypeDef, unknown>;
  execute: (input: T, ctx: AgentContext) => Promise<unknown>;
  validate?: (input: T, ctx: ValidateContext) => Promise<ValidationWarning[]>;
  resolveInput?: (input: T, ctx: ValidateContext) => Promise<T>;
  serialize?: (output: unknown) => unknown;
  describe?: (input: T) => AgentCard;
  summarize: (output: unknown) => string;
}

/** Factory that wires a typed Zod-validated executor into the runtime `AgentTool` shape. */
export function defineTool<T>(def: DefineToolInput<T>): AgentTool {
  return {
    name: def.name,
    description: def.description,
    access: def.access,
    confirmation: def.confirmation,
    label: def.label,
    invalidates: def.invalidates,
    schema: def.schema,
    execute: (input: unknown, ctx: AgentContext) => def.execute(input as T, ctx),
    serialize: def.serialize ?? ((output: unknown) => output),
    describe: def.describe as ((input: unknown) => AgentCard) | undefined,
    validate: def.validate as
      ((input: unknown, ctx: ValidateContext) => Promise<ValidationWarning[]>) | undefined,
    resolveInput: def.resolveInput as
      ((input: unknown, ctx: ValidateContext) => Promise<unknown>) | undefined,
    summarize: def.summarize,
  };
}

export interface AgentToolDeps {
  accountsService: AccountsService;
  analyticsService: AnalyticsService;
  searchService: SearchService;
  transactionsService: TransactionsService;
  categoriesService: CategoriesService;
  budgetsService: BudgetsService;
  goalsService: GoalsService;
  investmentsService: InvestmentsService;
  usersService: UsersService;
  actionManager: ActionManager;
  actionService: AgentActionService;
}

/**
 * Assembles the full list of registered agent tools from all domain tool
 * factories. Extracted here so `AgentService` constructor stays lean.
 */
export function buildAgentTools(deps: AgentToolDeps): AgentTool[] {
  return [
    ...createAccountsTools(deps.accountsService),
    ...createAnalyticsTools(deps.analyticsService),
    ...createSearchTools(deps.searchService),
    ...createTransactionsTools(deps.transactionsService),
    ...createTransactionsWriteTools(
      deps.transactionsService,
      deps.accountsService,
      deps.categoriesService,
    ),
    ...createTransactionRecordTools(
      deps.transactionsService,
      deps.accountsService,
      deps.categoriesService,
    ),
    ...createCategoriesTools(deps.categoriesService),
    ...createBudgetsTools(deps.budgetsService),
    ...createGoalsTools(deps.goalsService),
    ...createInvestmentsTools(deps.investmentsService),
    ...createInsightsTools(deps.analyticsService),
    ...createProfileTools(deps.usersService, deps.accountsService),
    ...createActionManagementTools(deps.actionManager, deps.actionService),
  ];
}
