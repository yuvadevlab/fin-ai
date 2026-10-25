/**
 * @file apps/api/src/modules/auth/jwks.util.ts
 * @description In-memory cached JWKS public key resolver for DevLab SSO RS256 JWT verification.
 * @module @finai/api/auth
 */

import crypto from "node:crypto";
import { Logger } from "@yuva-devlab/logger";

/**
 * In-memory representation of an SPKI PEM public key and its expiration timestamp.
 */
interface CachedKey {
  /** RSA SPKI public key formatted as PEM */
  pem: string;
  /** Milliseconds epoch timestamp after which the cached key must be refreshed */
  expiresAt: number;
}

/** Logger instance dedicated to JWKS retrieval and cryptographic conversion */
const logger = new Logger("JwksUtil");

/** Cache map storing resolved PEM strings keyed by key identifier (kid) */
const keyCache = new Map<string, CachedKey>();

/** Cache TTL for fetched public keys: 1 minute (allows fast recovery from key rotations) */
const CACHE_TTL_MS = 60 * 1000;

/**
 * Shape of an RFC 7517 JSON Web Key returned by the DevLab Gateway.
 */
interface JsonWebKey {
  /** Key type (expected: "RSA") */
  kty: string;
  /** Unique key identifier matching the JWT protected header */
  kid?: string;
  /** Intended key usage (expected: "sig") */
  use?: string;
  /** Cryptographic algorithm (expected: "RS256") */
  alg?: string;
  /** RSA modulus encoded in base64url */
  n?: string;
  /** RSA exponent encoded in base64url */
  e?: string;
}

/**
 * JSON Web Key Set container response.
 */
interface JwksResponse {
  keys: JsonWebKey[];
}

/**
 * Resolves the RSA public key in PEM format for a given key ID (kid) from the
 * DevLab Portal API JWKS endpoint (`/.well-known/jwks.json`). Caches results in-memory
 * to prevent high-frequency network roundtrips during authentication.
 *
 * @param portalApiUrl - Base URL of the DevLab Portal API (defaults to DEVLAB_PORTAL_API_URL or http://localhost:3015)
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

  // Return memoized key if still within the active TTL window
  if (cached && now < cached.expiresAt) {
    return cached.pem;
  }

  const normalizedUrl = portalApiUrl.replace(/\/+$/, "");
  const jwksUrl = `${normalizedUrl}/.well-known/jwks.json`;

  try {
    const res = await fetch(jwksUrl, {
      headers: { Accept: "application/json" },
    });

    // Guard against HTTP transport or routing errors
    if (!res.ok) {
      throw new Error(`JWKS endpoint returned HTTP ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as JwksResponse;

    // Validate that the JWKS document contains a non-empty list of keys
    if (!data?.keys || !Array.isArray(data.keys) || data.keys.length === 0) {
      throw new Error(`JWKS response contains no keys from ${jwksUrl}`);
    }

    // Match specifically by kid when available, or fall back to the primary RSA key
    const match = kid
      ? data.keys.find((k) => k.kid === kid) || data.keys.find((k) => k.kty === "RSA")
      : data.keys.find((k) => k.kty === "RSA");

    // Guard against mismatched or unsupported key types
    if (!match) {
      throw new Error(`No matching RSA key found in JWKS (searched kid: ${kid})`);
    }

    const keyObject = crypto.createPublicKey({
      key: match as crypto.JsonWebKey,
      format: "jwk",
    });
    const pem = keyObject.export({ type: "spki", format: "pem" }).toString();

    // Cache the validated PEM string for subsequent authentication checks
    keyCache.set(cacheKey, {
      pem,
      expiresAt: now + CACHE_TTL_MS,
    });

    logger.info(`[getDevLabPublicKey] Cached JWKS public key for kid: ${match.kid || "rsa"}`);
    return pem;
  } catch (err) {
    logger.error(`[getDevLabPublicKey] Failed to fetch JWKS from ${jwksUrl}:`, err);

    // If an earlier key was cached, return it to maintain service availability during network blips
    if (cached?.pem) {
      logger.warn(`[getDevLabPublicKey] Fallback to stale cached key for kid: ${cacheKey}`);
      return cached.pem;
    }

    throw err;
  }
}

/**
 * Invalidates cached JWKS keys, allowing subsequent requests to fetch fresh keys
 * immediately upon token verification failures or key rotation events.
 *
 * @param kid - Optional key ID to remove, or omit to clear the entire key cache
 */
export function invalidateJwksCache(kid?: string): void {
  if (kid) {
    keyCache.delete(kid);
  } else {
    keyCache.clear();
  }
  logger.info(`[invalidateJwksCache] Cleared JWKS cache${kid ? ` for kid: ${kid}` : ""}`);
}
