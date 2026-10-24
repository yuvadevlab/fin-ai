import { describe, expect, it } from "vitest";
import { AiProvider, AiProviderRole } from "@finai/shared-types";
import { resolveAiProvider, createChatModel } from "../llm/provider-factory";

describe("provider-factory role resolution", () => {
  it("resolves role-specific provider when set", () => {
    const env = {
      AI_PROVIDER: AiProvider.OLLAMA,
      AI_PROVIDER_AGENT: AiProvider.GOOGLE_AI_STUDIO,
      AI_PROVIDER_CHAT: AiProvider.GROQ,
    };

    const agentRole: AiProviderRole = AiProviderRole.AGENT;
    const chatRole: AiProviderRole = AiProviderRole.CHAT;

    expect(resolveAiProvider(env, agentRole)).toBe(AiProvider.GOOGLE_AI_STUDIO);
    expect(resolveAiProvider(env, chatRole)).toBe(AiProvider.GROQ);
    expect(resolveAiProvider(env)).toBe(AiProvider.OLLAMA);
  });

  it("falls back to AI_PROVIDER when role-specific provider is unset", () => {
    const env = {
      AI_PROVIDER: AiProvider.GROQ,
    };

    expect(resolveAiProvider(env, AiProviderRole.AGENT)).toBe(AiProvider.GROQ);
    expect(resolveAiProvider(env, AiProviderRole.CHAT)).toBe(AiProvider.GROQ);
  });

  it("throws when no provider env var is set (no default provider)", () => {
    expect(() => resolveAiProvider({}, AiProviderRole.AGENT)).toThrow(
      /AI_PROVIDER_AGENT or AI_PROVIDER/,
    );
    expect(() => resolveAiProvider({}, AiProviderRole.CHAT)).toThrow(
      /AI_PROVIDER_CHAT or AI_PROVIDER/,
    );
    expect(() => resolveAiProvider({})).toThrow(/AI_PROVIDER/);
  });

  it("throws on unknown provider value", () => {
    expect(() => resolveAiProvider({ AI_PROVIDER: "bogus" })).toThrow(/Unknown AI provider: bogus/);
  });

  it("selects role-specific model override if provided", () => {
    const env = {
      AI_PROVIDER: AiProvider.GROQ,
      GROQ_BASE_URL: "https://api.groq.com",
      GROQ_API_PATH: "/openai/v1/chat/completions",
      GROQ_API_KEY: "dummy-key",
      GROQ_MODEL: "qwen/qwen3.8-27b",
      GROQ_CHAT_MODEL: "qwen/qwen3.8-27b",
      GROQ_AGENT_MODEL: "llama-3.3-70b-versatile",
    };

    const agentModel = createChatModel(AiProvider.GROQ, env, AiProviderRole.AGENT);
    expect(agentModel.model).toBe("llama-3.3-70b-versatile");

    const chatModel = createChatModel(AiProvider.GROQ, env, AiProviderRole.CHAT);
    expect(chatModel.model).toBe("qwen/qwen3.8-27b");
  });

  it("throws when model env var is missing (no default model)", () => {
    const env = {
      AI_PROVIDER: AiProvider.GROQ,
      GROQ_BASE_URL: "https://api.groq.com",
      GROQ_API_PATH: "/openai/v1/chat/completions",
      GROQ_API_KEY: "dummy-key",
    };

    expect(() => createChatModel(AiProvider.GROQ, env)).toThrow(/GROQ_MODEL/);
  });

  it("throws when base url is missing", () => {
    const env = {
      GROQ_API_PATH: "/openai/v1/chat/completions",
      GROQ_API_KEY: "dummy-key",
      GROQ_MODEL: "openai/gpt-oss-120b",
    };

    expect(() => createChatModel(AiProvider.GROQ, env)).toThrow(/GROQ_BASE_URL/);
  });

  it("throws when api key is missing for cloud providers", () => {
    const env = {
      GROQ_BASE_URL: "https://api.groq.com",
      GROQ_API_PATH: "/openai/v1/chat/completions",
      GROQ_MODEL: "openai/gpt-oss-120b",
    };

    expect(() => createChatModel(AiProvider.GROQ, env)).toThrow(/GROQ_API_KEY/);
  });

  it("does not require an api key for local ollama", () => {
    const env = {
      OLLAMA_BASE_URL: "http://localhost:11434",
      OLLAMA_API_PATH: "/v1/chat/completions",
      OLLAMA_MODEL: "qwen3:8b",
    };

    const model = createChatModel(AiProvider.OLLAMA, env);
    expect(model.provider).toBe(AiProvider.OLLAMA);
    expect(model.model).toBe("qwen3:8b");
  });
});
