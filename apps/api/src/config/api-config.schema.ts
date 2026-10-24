/**
 * @file apps/api/src/config/api-config.schema.ts
 * @description Zod validation schema for FinAI API environment configuration.
 * @module @finai/api/config
 */

import { z } from "zod";
import { AiProvider } from "@finai/shared-types";

/**
 * Zod schema validating backend runtime configuration.
 * Consolidates all environment variables into a strongly-typed schema.
 */
export const ApiConfigSchema = z.object({
  /** HTTP server port */
  port: z.coerce.number().int().positive().default(4001),

  /**
   * Single canonical web URL for frontend access and CORS origins.
   * Can be a single origin or comma-separated origins.
   */
  webUrl: z.string().default("http://localhost:3001"),

  /**
   * DevLab Portal API base URL for OIDC discovery and JWKS public key verification.
   */
  portalApiUrl: z.string().default("http://localhost:4000"),

  /**
   * @deprecated Use portalApiUrl instead.
   */
  gatewayUrl: z.string().default("http://localhost:3015"),

  /** Node execution environment mode */
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),

  /** PostgreSQL database connection string */
  databaseUrl: z.string().optional(),

  /** JWT secret key used for signing and verifying tokens */
  jwtSecret: z.string().default("SuperSecretProductionJwtKey2026FinAi!"),

  /** JWT expiration duration string (e.g., '7d', '24h') */
  jwtExpiry: z.string().default("7d"),

  /** Active AI provider */
  aiProvider: z.nativeEnum(AiProvider).default(AiProvider.OLLAMA),

  /** Optional role-specific AI provider override for tool-calling agent */
  aiProviderAgent: z.nativeEnum(AiProvider).optional(),

  /** Optional role-specific AI provider override for conversational chat */
  aiProviderChat: z.nativeEnum(AiProvider).optional(),

  /** Ollama local AI configuration */
  ollamaBaseUrl: z.string().default("http://localhost:11434"),
  ollamaApiPath: z.string().default("/api/chat"),
  ollamaModel: z.string().default("gemma4:31b-cloud"),

  /** OpenRouter configuration */
  openrouterBaseUrl: z.string().default("https://openrouter.ai/api"),
  openrouterApiPath: z.string().default("/v1/chat/completions"),
  openrouterApiKey: z.string().optional(),
  openrouterModel: z.string().optional(),

  /** Groq configuration */
  groqBaseUrl: z.string().default("https://api.groq.com"),
  groqApiPath: z.string().default("/openai/v1/chat/completions"),
  groqApiKey: z.string().optional(),
  groqModel: z.string().optional(),

  /** Google AI Studio configuration */
  googleAiStudioBaseUrl: z.string().default("https://generativelanguage.googleapis.com"),
  googleAiStudioApiPath: z.string().default("/v1beta/openai/chat/completions"),
  googleAiStudioApiKey: z.string().optional(),
  googleAiStudioModel: z.string().optional(),

  /** Master switch for application logging */
  logEnabled: z.boolean().default(true),

  /** Minimum log level threshold */
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),

  /** Whether HTTP request logging is active */
  logRequests: z.boolean().default(true),

  /** Whether to persist log entries to a local file */
  logPersist: z.boolean().default(false),

  /** Target file path for log persistence */
  logFile: z.string().optional(),
});

/**
 * Raw validated configuration inferred directly from the schema.
 */
export type RawApiConfig = z.infer<typeof ApiConfigSchema>;

/**
 * Enhanced configuration object containing computed helper fields.
 */
export interface ApiConfig extends RawApiConfig {
  /** Array of parsed and trimmed CORS origin URLs derived from `webUrl` */
  corsOrigins: string[];
  /** Primary web frontend base URL for password reset links and emails */
  frontendBaseUrl: string;
}
