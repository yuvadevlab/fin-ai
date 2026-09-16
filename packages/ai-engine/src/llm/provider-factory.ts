/**
 * Provider-agnostic factory that constructs a {@link ChatModel} from
 * environment variables.
 *
 * The active provider is chosen via `AI_PROVIDER` env var (or the role-specific
 * `AI_PROVIDER_AGENT` / `AI_PROVIDER_CHAT`):
 *   - `openrouter`        → OpenRouter
 *   - `groq`              → Groq
 *   - `google-ai-studio`  → Google AI Studio
 *   - `ollama`            → Local Ollama
 *
 * There are NO hardcoded endpoints and NO default provider or model — every
 * value MUST come from env vars. If any required config is missing the factory
 * throws immediately and the app fails to start (fail-fast, no silent fallbacks):
 *
 *   {PROVIDER}_BASE_URL   root URL, e.g. OPENROUTER_BASE_URL="https://openrouter.ai/api"
 *   {PROVIDER}_API_PATH   API path, e.g. OPENROUTER_API_PATH="/v1/chat/completions"
 *   {PROVIDER}_MODEL      model name (or role-specific {PROVIDER}_{ROLE}_MODEL)
 *
 * Each provider also pulls its API key from a dedicated env var:
 *   OPENROUTER_API_KEY, GROQ_API_KEY, GOOGLE_AI_STUDIO_API_KEY, OLLAMA_API_KEY
 *   (API key is required for cloud providers; optional for local Ollama.)
 *
 * This factory is a pure function library — it contains zero NestJS DI
 * state and is consumable directly from the API layer or from tests.
 */

import { OllamaChatModel } from "./ollama-chat.model";
import { OpenRouterChatModel } from "./openrouter-chat.model";
import { GroqChatModel } from "./groq-chat.model";
import { GoogleAiStudioChatModel } from "./google-ai-studio.model";
import type { ChatModel, ChatModelConfig } from "./types";

/** Discriminated union of all supported provider identifiers. */
export type AiProvider = "openrouter" | "groq" | "google-ai-studio" | "ollama";

/** Operational role for an LLM: tool-calling agent loop vs. fast conversational chat/insights. */
export type AiProviderRole = "agent" | "chat";

/**
 * Provider wiring — env var names for each credential/model.  There are NO
 * hardcoded API endpoints, no default provider, and no default model: base URL,
 * API path, and model MUST come from env vars (`{PROVIDER}_BASE_URL`,
 * `{PROVIDER}_API_PATH`, `{PROVIDER}_MODEL`).  The factory fails fast with a
 * descriptive error when any of them is missing.
 */
const PROVIDER_ENV_KEYS: Record<AiProvider, { envKey: string; envModel: string }> = {
  openrouter: {
    envKey: "OPENROUTER_API_KEY",
    envModel: "OPENROUTER_MODEL",
  },
  groq: {
    envKey: "GROQ_API_KEY",
    envModel: "GROQ_MODEL",
  },
  "google-ai-studio": {
    envKey: "GOOGLE_AI_STUDIO_API_KEY",
    envModel: "GOOGLE_AI_STUDIO_MODEL",
  },
  ollama: {
    envKey: "OLLAMA_API_KEY",
    envModel: "OLLAMA_MODEL",
  },
};

/**
 * Resolve the provider from `AI_PROVIDER_AGENT` / `AI_PROVIDER_CHAT` (when role is given)
 * or `AI_PROVIDER`.  Throws when none of them is set — there is no default provider.
 */
export function resolveAiProvider(
  env: Record<string, string | undefined> = process.env,
  role?: AiProviderRole,
): AiProvider {
  const roleKey =
    role === "agent" ? "AI_PROVIDER_AGENT" : role === "chat" ? "AI_PROVIDER_CHAT" : undefined;
  const candidate = roleKey && env[roleKey] ? env[roleKey] : env.AI_PROVIDER;

  if (!candidate) {
    const expected = roleKey ? `${roleKey} or AI_PROVIDER` : "AI_PROVIDER";
    throw new Error(
      `AI provider config error: required env var ${expected} is not set. ` +
        `Set it in your .env file (e.g. AI_PROVIDER="groq"). ` +
        `Supported values: openrouter, groq, google-ai-studio, ollama.`,
    );
  }

  const raw = candidate.toLowerCase().trim();
  if (isAiProvider(raw)) return raw;

  throw new Error(
    `Unknown AI provider: ${raw}. ` +
      `Supported values: openrouter, groq, google-ai-studio, ollama.`,
  );
}

export function isAiProvider(value: string): value is AiProvider {
  return (
    value === "openrouter" || value === "groq" || value === "google-ai-studio" || value === "ollama"
  );
}

/**
 * Build a {@link ChatModel} for the given provider using environment variables.
 *
 * Base URL, API path, and model are REQUIRED env vars — there are no hardcoded
 * endpoints and no default model.  Cloud providers additionally require their
 * API key.  Throws immediately when any required config is missing.
 */
export function createChatModel(
  provider: AiProvider,
  env: Record<string, string | undefined> = process.env,
  role?: AiProviderRole,
): ChatModel {
  const wiring = PROVIDER_ENV_KEYS[provider];
  const prefix = provider.toUpperCase().replace(/-/g, "_");
  const baseUrl = env[`${prefix}_BASE_URL`];
  const apiPath = env[`${prefix}_API_PATH`];
  const apiKey = env[wiring.envKey];
  const roleModelKey = role ? `${prefix}_${role.toUpperCase()}_MODEL` : undefined;
  const model = (roleModelKey && env[roleModelKey]) || env[wiring.envModel];

  if (!baseUrl) {
    throw new Error(
      `AI provider "${provider}" is missing required env var ${prefix}_BASE_URL. ` +
        `Set it in your .env file (e.g. ${prefix}_BASE_URL="https://...").`,
    );
  }
  if (!apiPath) {
    throw new Error(
      `AI provider "${provider}" is missing required env var ${prefix}_API_PATH. ` +
        `Set it in your .env file (e.g. ${prefix}_API_PATH="/v1/chat/completions").`,
    );
  }
  if (!model) {
    const expected = roleModelKey ? `${roleModelKey} or ${wiring.envModel}` : wiring.envModel;
    throw new Error(
      `AI provider "${provider}" is missing required env var ${expected}. ` +
        `There is no default model — set it in your .env file ` +
        `(e.g. ${wiring.envModel}="provider/model-name").`,
    );
  }

  // Ensure cloud providers have a key (local Ollama runs keyless).
  const requiresKey = provider !== "ollama";
  if (requiresKey && !apiKey) {
    throw new Error(
      `AI provider "${provider}" requires an API key but ${wiring.envKey} is not set. ` +
        `Set it in your .env file or environment variables.`,
    );
  }

  const config: ChatModelConfig = { baseUrl, apiPath, model, apiKey };

  switch (provider) {
    case "openrouter":
      return new OpenRouterChatModel(config);
    case "groq":
      return new GroqChatModel(config);
    case "google-ai-studio":
      return new GoogleAiStudioChatModel(config);
    case "ollama":
      return new OllamaChatModel(config);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

/**
 * Create a {@link ChatModel} using the provider resolved from role-based or
 * `AI_PROVIDER` env vars.  Throws when the provider, base URL, API path, model,
 * or (for cloud providers) API key is not configured — no defaults, fail fast.
 */
export function createChatModelFromEnv(
  env: Record<string, string | undefined> = process.env,
  role?: AiProviderRole,
): ChatModel {
  const provider = resolveAiProvider(env, role);
  return createChatModel(provider, env, role);
}
