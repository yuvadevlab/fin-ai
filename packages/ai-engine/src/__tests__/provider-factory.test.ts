import { describe, expect, it } from "vitest";
import { resolveAiProvider, createChatModel, type AiProviderRole } from "../llm/provider-factory";

describe("provider-factory role resolution", () => {
  it("resolves role-specific provider when set", () => {
    const env = {
      AI_PROVIDER: "ollama",
      AI_PROVIDER_AGENT: "google-ai-studio",
      AI_PROVIDER_CHAT: "groq",
    };

    const agentRole: AiProviderRole = "agent";
    const chatRole: AiProviderRole = "chat";

    expect(resolveAiProvider(env, agentRole)).toBe("google-ai-studio");
    expect(resolveAiProvider(env, chatRole)).toBe("groq");
    expect(resolveAiProvider(env)).toBe("ollama");
  });

  it("falls back to AI_PROVIDER when role-specific provider is unset", () => {
    const env = {
      AI_PROVIDER: "groq",
    };

    expect(resolveAiProvider(env, "agent")).toBe("groq");
    expect(resolveAiProvider(env, "chat")).toBe("groq");
  });

  it("throws when no provider env var is set (no default provider)", () => {
    expect(() => resolveAiProvider({}, "agent")).toThrow(/AI_PROVIDER_AGENT or AI_PROVIDER/);
    expect(() => resolveAiProvider({}, "chat")).toThrow(/AI_PROVIDER_CHAT or AI_PROVIDER/);
    expect(() => resolveAiProvider({})).toThrow(/AI_PROVIDER/);
  });

  it("throws on unknown provider value", () => {
    expect(() => resolveAiProvider({ AI_PROVIDER: "bogus" })).toThrow(/Unknown AI provider: bogus/);
  });

  it("selects role-specific model override if provided", () => {
    const env = {
      AI_PROVIDER: "groq",
      GROQ_BASE_URL: "https://api.groq.com",
      GROQ_API_PATH: "/openai/v1/chat/completions",
      GROQ_API_KEY: "dummy-key",
      GROQ_MODEL: "qwen/qwen3.8-27b",
      GROQ_CHAT_MODEL: "qwen/qwen3.8-27b",
      GROQ_AGENT_MODEL: "llama-3.3-70b-versatile",
    };

    const agentModel = createChatModel("groq", env, "agent");
    expect(agentModel.model).toBe("llama-3.3-70b-versatile");

    const chatModel = createChatModel("groq", env, "chat");
    expect(chatModel.model).toBe("qwen/qwen3.8-27b");
  });

  it("throws when model env var is missing (no default model)", () => {
    const env = {
      AI_PROVIDER: "groq",
      GROQ_BASE_URL: "https://api.groq.com",
      GROQ_API_PATH: "/openai/v1/chat/completions",
      GROQ_API_KEY: "dummy-key",
    };

    expect(() => createChatModel("groq", env)).toThrow(/GROQ_MODEL/);
  });

  it("throws when base url is missing", () => {
    const env = {
      GROQ_API_PATH: "/openai/v1/chat/completions",
      GROQ_API_KEY: "dummy-key",
      GROQ_MODEL: "openai/gpt-oss-120b",
    };

    expect(() => createChatModel("groq", env)).toThrow(/GROQ_BASE_URL/);
  });

  it("throws when api key is missing for cloud providers", () => {
    const env = {
      GROQ_BASE_URL: "https://api.groq.com",
      GROQ_API_PATH: "/openai/v1/chat/completions",
      GROQ_MODEL: "openai/gpt-oss-120b",
    };

    expect(() => createChatModel("groq", env)).toThrow(/GROQ_API_KEY/);
  });

  it("does not require an api key for local ollama", () => {
    const env = {
      OLLAMA_BASE_URL: "http://localhost:11434",
      OLLAMA_API_PATH: "/v1/chat/completions",
      OLLAMA_MODEL: "qwen3:8b",
    };

    const model = createChatModel("ollama", env);
    expect(model.provider).toBe("ollama");
    expect(model.model).toBe("qwen3:8b");
  });
});
