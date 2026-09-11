# FinAI Backend API Architecture Rules (`apps/api`)

> **Scope**: Applies to `apps/api` (NestJS 10 REST API).

---

## 1. 5-Layer Module Architecture

Every feature module under `apps/api/src/modules/<feature>/` must follow the standardized 5-layer layout:

```text
apps/api/src/modules/<feature>/
├── <feature>.controller.ts       # 1. ROUTES: HTTP endpoints, Guards, Swagger OpenAPI docs, status codes
├── <feature>.module.ts           # NestJS Module: Dependency injection wiring
├── dto/                          # 2. DTOs: Request/response interfaces, query filter DTOs
│   ├── index.ts
│   └── <entity>.dto.ts
├── repositories/                 # 3. REPOSITORIES: Direct Prisma queries, pagination, complex joins
│   ├── index.ts
│   └── <feature>.repository.ts
├── services/                     # 4. SERVICES: Domain workflows, atomic business mutations, use-cases
│   ├── index.ts
│   └── <use-case>.service.ts
└── utils/                        # 5. UTILS: Pure helpers, formatters, mathematical logic (zero DB/IO)
    ├── index.ts
    └── <feature>.utils.ts
```

### Layer Responsibilities & Rules

| Layer                                 | Allowed                                                          | Forbidden                                         |
| :------------------------------------ | :--------------------------------------------------------------- | :------------------------------------------------ |
| **1. Routes** (`*.controller.ts`)     | Status codes, `@UseGuards()`, `@CurrentUser()`, calling services | Direct Prisma queries, business calculations      |
| **2. DTOs** (`dto/`)                  | Re-exporting Zod types (`@finai/validation`) & shared interfaces | Runtime business logic, database queries          |
| **3. Repositories** (`repositories/`) | Prisma client queries, ordering, relations, pagination           | HTTP request context, Excel generation, LLM calls |
| **4. Services** (`services/`)         | Co-ordinating repositories, business checks, atomic workflows    | Raw SQL queries, presentation formatting          |
| **5. Utils** (`utils/`)               | Pure formulas, string parsers, formatters, pure transformations  | Database access, HTTP calls, NestJS DI state      |

---

## 2. Security & Authorization

1. **Mandatory Guard**: Every public endpoint must be protected by `@UseGuards(JwtAuthGuard)` unless explicitly annotated with `@Public()`.
2. **Ownership Scoping**: All Prisma queries in repositories MUST scope queries by `userId` or `workspaceId`. Never perform un-scoped queries that could return another user's financial data.
3. **OpenAPI Documentation**: Decorate every controller action with `@ApiOperation()`, `@ApiResponse()`, and `@ApiBearerAuth()`.

---

## 3. Dependency Injection & Circular Import Prevention

1. **Avoid Service Imports via Barrels**: Services must never import other services through a barrel `index.ts` that re-exports them. Import directly from the target file:
   ```ts
   // CORRECT:
   import { buildConfirmationCard } from "./dispatchers/agent-proposal-builder";

   // FORBIDDEN (causes circular undefined DI in NestJS):
   import { buildConfirmationCard } from "./dispatchers";
   ```
2. **Use `forwardRef` for Co-dependent Providers**: When two services must reference each other, use `@Inject(forwardRef(() => ServiceName))` on the constructor parameter.
3. **Module Facades**: When decomposing a service into specialized sub-services, provide a thin root facade (e.g. `transactions.service.ts` or `analytics.service.ts`) to maintain 100% backward-compatible import paths.
