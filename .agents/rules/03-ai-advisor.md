# FinAI AI Engine & Agent Subsystem Rules

> **Scope**: Applies to `packages/ai-engine`, `apps/api/src/modules/agent/`, `apps/api/src/modules/ai/`, and `apps/web/src/features/ai-advisor/`.

---

## 1. Prompt Ownership & Boundaries

- **Single Source of Truth (`@finai/ai-engine`)**: ALL system prompts, user prompt templates, tool plan instructions, follow-up parsers, and safety guardrails MUST live in `@finai/ai-engine`.
- **No Inline Prompts**: API controllers and services MUST NOT define inline prompt strings. They may only assemble dynamic context (e.g. portfolio snapshots, recent history) and pass it to prompt builders from `@finai/ai-engine`.

---

## 2. Persona, Brand Limits & Currency

1. **Brand Identity**: The AI advisor IS FinAI. NEVER recommend external applications or spreadsheet tools (e.g. Google Sheets, Excel, Mint, YNAB).
2. **FinAI Feature References**: Guide users to native FinAI features:
   - FinAI Accounts, FinAI Transactions, FinAI Budgets, FinAI Goals, FinAI Investments, and Category Manager.
3. **Currency Formatting**: Always format currency figures in Indian Rupees (₹) using Indian numbering system conventions via `@finai/finance-engine` (`formatINR`).
4. **Tone**: Warm, encouraging, empathetic, and financially prudent.

---

## 3. Strict Domain Scope & Rejection Policy

1. **Personal Finance Only**: The advisor is exclusively a personal financial assistant.
2. **Polite Non-Financial Refusal**: If a user asks non-financial questions (e.g., politics, coding, sports, trivia, cooking), the model MUST politely refuse using the standard refusal prompt in `@finai/ai-engine`.
3. **Follow-Up Suggestions**: Conclude interactive conversational turns with 2 to 3 relevant, contextual follow-up questions under `### Follow-up Suggestions:`.

---

## 4. Two-Phase Write Tool Execution (Safety Choke-Point)

1. **Confirmation Policy**:
   - `access: "read"` tools execute immediately.
   - `access: "write"` tools MUST declare `confirmation: "required"`.
2. **Two-Phase Write Lifecycle**:
   - **Phase 1 (Propose)**: The model proposes the write action. A `PROPOSED` row is stored with a 15-minute TTL, and a confirmation card is streamed to the client. The database state is NOT modified.
   - **Phase 2 (Confirm / Reject)**: The user explicitly confirms the proposed action via the UI card. Only upon user confirmation does the service execute the mutation.
3. **Bulk Actions**: For destructive or bulk actions (like recategorization), always execute a dry-run preview first to report the exact count of affected items before proposing the change.
