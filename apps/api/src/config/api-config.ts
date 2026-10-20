/**
 * @file apps/api/src/config/api-config.ts
 * @description Configuration loader parsing and validating process.env into strongly-typed ApiConfig.
 * @module @finai/api/config
 */

import path from "node:path";
import dotenv from "dotenv";
import { ApiConfigSchema, type ApiConfig } from "./api-config.schema";

let cachedConfig: ApiConfig | null = null;

/**
 * Normalizes boolean values from environment variable strings.
 *
 * @param val - Raw environment variable string
 * @param defaultValue - Fallback value if unset
 * @returns Parsed boolean
 */
function parseBoolean(val?: string, defaultValue = true): boolean {
  // If undefined or empty string, default value is retained
  if (val === undefined || val === "") {
    return defaultValue;
  }
  // Explicitly check for falsy string indicators
  return val !== "false" && val !== "0";
}

/**
 * Normalizes and validates log levels against permitted literals.
 *
 * @param raw - Raw log level string
 * @returns Strongly-typed log level literal
 */
function parseLogLevel(raw?: string): "debug" | "info" | "warn" | "error" {
  // Guard against missing values by defaulting to info
  if (!raw) {
    return "info";
  }
  const normalized = raw.trim().toLowerCase();
  // Validate against acceptable LogLevel values
  if (["debug", "info", "warn", "error"].includes(normalized)) {
    return normalized as "debug" | "info" | "warn" | "error";
  }
  return "info";
}

/**
 * Loads, validates, and freezes runtime configuration from process.env.
 * Caches the parsed configuration singleton after the first invocation.
 *
 * @returns Fully validated and strongly-typed ApiConfig object
 */
export function loadApiConfig(): ApiConfig {
  // Return memoized configuration if already loaded
  if (cachedConfig) {
    return cachedConfig;
  }

  // Load root monorepo .env first, then local app-specific overrides
  dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
  dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: true });

  const rawWebUrl = process.env.WEB_URL || "http://localhost:3000";
  const parsedCorsOrigins = rawWebUrl
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Fallback to localhost:3000 if no valid origins were parsed
  const corsOrigins = parsedCorsOrigins.length > 0 ? parsedCorsOrigins : ["http://localhost:3000"];
  // The first origin in the list is always canonical for frontend links/resets
  const frontendBaseUrl = corsOrigins[0] || "http://localhost:3000";

  const parsed = ApiConfigSchema.parse({
    port: process.env.PORT,
    webUrl: rawWebUrl,
    portalApiUrl: process.env.DEVLAB_PORTAL_API_URL || "http://localhost:3015",
    gatewayUrl: process.env.DEVLAB_PORTAL_API_URL || "http://localhost:3015",
    nodeEnv: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiry: process.env.JWT_EXPIRY,
    aiProvider: process.env.AI_PROVIDER,
    aiProviderAgent: process.env.AI_PROVIDER_AGENT,
    aiProviderChat: process.env.AI_PROVIDER_CHAT,
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
    ollamaApiPath: process.env.OLLAMA_API_PATH,
    ollamaModel: process.env.OLLAMA_MODEL,
    openrouterBaseUrl: process.env.OPENROUTER_BASE_URL,
    openrouterApiPath: process.env.OPENROUTER_API_PATH,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterModel: process.env.OPENROUTER_MODEL,
    groqBaseUrl: process.env.GROQ_BASE_URL,
    groqApiPath: process.env.GROQ_API_PATH,
    groqApiKey: process.env.GROQ_API_KEY,
    groqModel: process.env.GROQ_MODEL,
    googleAiStudioBaseUrl: process.env.GOOGLE_AI_STUDIO_BASE_URL,
    googleAiStudioApiPath: process.env.GOOGLE_AI_STUDIO_API_PATH,
    googleAiStudioApiKey: process.env.GOOGLE_AI_STUDIO_API_KEY,
    googleAiStudioModel: process.env.GOOGLE_AI_STUDIO_MODEL,
    logEnabled: parseBoolean(process.env.LOG_ENABLED, true),
    logLevel: parseLogLevel(process.env.LOG_LEVEL),
    logRequests: parseBoolean(process.env.LOG_REQUESTS, true),
    logPersist: parseBoolean(process.env.LOG_PERSIST, false),
    logFile: process.env.LOG_FILE || undefined,
  });

  cachedConfig = Object.freeze({
    ...parsed,
    corsOrigins,
    frontendBaseUrl,
  });

  return cachedConfig;
}

/**
 * Singleton instance of validated ApiConfig.
 * Ready for immediate import and usage throughout the application.
 */
export const config: ApiConfig = loadApiConfig();
