# @finai/ai-engine

`@finai/ai-engine` is the centralized LLM orchestration and prompt engineering package for the FinAI ecosystem. It encapsulates system personas, structured prompt factories, domain safety guardrails, Ollama NDJSON streaming clients, and ReAct agent planning abstractions.

It contains **zero database access or HTTP server code**, operating as a pure library consumed by `apps/api` and offline evaluation harnesses.

---

## Architecture Overview

```text
packages/ai-engine/
├── src/
│   ├── persona.ts             # System prompt persona & safety boundaries
│   ├── prompts.config.ts      # Structured prompt templates & follow-up rules
│   ├── prompt-builder.ts      # Context injection & dynamic prompt compiler
│   ├── extract-follow-ups.ts  # Parser for 1-click suggested follow-up chips
│   ├── types.ts               # Core AI types, chat roles & interfaces
│   ├── agent/                 # Agent prompt builder & SSE stream event schemas
│   │   ├── agent-prompt.ts    # ReAct instructions & tool usage prompt compiler
│   │   └── stream-events.ts   # SSE event types (token, phase, tool_call, error)
│   └── llm/                   # Ollama client & JSON planning fallback
│       ├── types.ts           # ChatModel interfaces & tool calling abstractions
│       ├── ollama-chat.model.ts # Native NDJSON streaming client for Ollama
│       └── json-planning.ts   # Fallback tool-calling parser & stream filter
```

---

## Core Capabilities

### 1. Advisor Persona & Safety Guardrails (`src/persona.ts`)

Defines the financial advisor persona with strict compliance rules:

- **Tone**: Empathetic, analytical, concise, and non-judgmental.
- **Safety Boundaries**: Explicit disclaimers for non-financial queries, medical/legal questions, or speculative gambling advice.
- **Currency & Formatting**: Enforces INR (`₹`) formatting standards across all advisory responses.

### 2. Ollama Chat Client & Streaming (`src/llm/ollama-chat.model.ts`)

- Implements `ChatModel` for local or cloud Ollama instances.
- Handles full NDJSON streaming chunks with token usage and function call extraction.
- Automatic fallback error mapping with `LlmConnectionError`.

### 3. ReAct Agent Tool Planning (`src/llm/json-planning.ts`, `src/agent/agent-prompt.ts`)

- Provides tool manifests and instructions for Ollama models with native tool calling support.
- Implements `<tool_plan>` streaming filters to parse and execute structured multi-step actions even when the LLM outputs thought steps before tool invocation.

### 4. Dynamic Prompt Building & Follow-Ups (`src/prompt-builder.ts`, `src/extract-follow-ups.ts`)

- Injects real-time user portfolio context, net worth, linked accounts, and active budgets into the LLM system prompt.
- Extracts contextual, single-click follow-up query suggestions at the end of each assistant response.

---

## Scripts

```bash
# Typecheck package
pnpm --filter @finai/ai-engine typecheck

# Run unit tests
pnpm --filter @finai/ai-engine test

# Build package dist
pnpm --filter @finai/ai-engine build
```
