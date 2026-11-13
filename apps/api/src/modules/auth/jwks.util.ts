/**
 * @file apps/api/src/modules/auth/jwks.util.ts
 * @description In-memory cached JWKS public key resolver for DevLab SSO RS256 JWT verification.
 * @module @finai/api/auth
 */

import crypto from "node:crypto";
import { Logger } from "@yuva-devlab/logger";
import { DEFAULT_JWKS_PATH } from "@yuva-devlab/auth-server";

export { DEFAULT_JWKS_PATH };

interface CachedKey {
  pem: string;
  expiresAt: number;
}

const logger = new Logger("JwksUtil");
const keyCache = new Map<string, CachedKey>();
const CACHE_TTL_MS = 60 * 1000;

interface JsonWebKey {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
}

interface JwksResponse {
  keys: JsonWebKey[];
}

/**
 * Invalidates the in-memory JWKS public key cache to force immediate key re-fetching.
 */
export function invalidateJwksCache(): void {
  keyCache.clear();
  logger.info("[invalidateJwksCache] Cleared in-memory JWKS public key cache");
}

/**
 * Resolves the RSA public key in PEM format for a given key ID (kid) from the
 * DevLab Portal API JWKS endpoint (`/.well-known/jwks.json`). Caches results in-memory.
 *
 * @param portalApiUrl - Base URL of the DevLab Portal API (defaults to DEVLAB_PORTAL_API_URL or http://localhost:4000)
 * @param kid - Optional key ID matching the JWT protected header
 * @returns RSA public key formatted as an SPKI PEM string
 */
export async function getDevLabPublicKey(
  portalApiUrl = process.env.DEVLAB_PORTAL_API_URL || "http://localhost:4000",
  kid?: string,
): Promise<string> {
  const cacheKey = kid || "default";
  const now = Date.now();
  const cached = keyCache.get(cacheKey);

  if (cached && now < cached.expiresAt) {
    return cached.pem;
  }

  const normalizedUrl = portalApiUrl.replace(/\/+$/, "");
  const jwksUrl = `${normalizedUrl}${DEFAULT_JWKS_PATH}`;

  try {
    const res = await fetch(jwksUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`JWKS endpoint returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as JwksResponse;
    if (!data?.keys || !Array.isArray(data.keys) || data.keys.length === 0) {
      throw new Error(`JWKS response contains no keys from ${jwksUrl}`);
    }

    const match = kid
      ? data.keys.find((k) => k.kid === kid) || data.keys.find((k) => k.kty === "RSA")
      : data.keys.find((k) => k.kty === "RSA");

    if (!match) {
      throw new Error(`No matching RSA public key found in JWKS for kid: ${kid || "none"}`);
    }

    const keyObject = crypto.createPublicKey({
      key: match as crypto.JsonWebKey,
      format: "jwk",
    });

    const pem = keyObject.export({ type: "spki", format: "pem" }).toString();

    keyCache.set(cacheKey, { pem, expiresAt: now + CACHE_TTL_MS });
    logger.info(`[getDevLabPublicKey] Cached JWKS public key for kid: ${match.kid || "rsa"}`);

    return pem;
  } catch (err) {
    logger.error(`[getDevLabPublicKey] Failed to fetch JWKS from ${jwksUrl}:`, err);
    if (cached) {
      logger.warn(`[getDevLabPublicKey] Fallback to stale cached key for kid: ${cacheKey}`);
      return cached.pem;
    }
    throw err;
  }
}
