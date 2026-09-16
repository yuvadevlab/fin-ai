import { SEMANTIC_CLUSTERS } from "./entity-synonyms";

export interface EntityRef {
  id?: string | null;
  name?: string | null;
}

export interface NamedEntity {
  id: string;
  name: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SEPARATOR_RE = /[&,._/+()[\]{}#-]+/g;

/** Classify a raw string as an entity ID (UUID) or a display/search name. */
export function splitRef(value?: string | null): EntityRef | undefined {
  if (!value || value.trim().length === 0) return undefined;
  const trimmed = value.trim();
  return UUID_RE.test(trimmed) ? { id: trimmed } : { name: trimmed };
}

/** Canonicalize a name: lowercase, special chars become spaces, whitespace collapsed. */
export function normalizeEntityName(value: string): string {
  return value.toLowerCase().replace(SEPARATOR_RE, " ").replace(/\s+/g, " ").trim();
}

/** Fast Levenshtein distance for typo matching on words */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j]!;
      dp[j] = a[i - 1] === b[j - 1] ? prev : Math.min(prev, dp[j - 1]!, dp[j]!) + 1;
      prev = temp;
    }
  }
  return dp[n]!;
}

/**
 * Checks if candidate and query share words within any semantic concept cluster.
 * Works dynamically across any user-defined category name.
 */
function scoreDynamicClusterMatch(candidateNorm: string, queryNorm: string): number {
  const cTokens = candidateNorm.split(" ").filter((t) => t.length > 2);
  const qTokens = queryNorm.split(" ").filter((t) => t.length > 2);

  for (const cluster of SEMANTIC_CLUSTERS) {
    const candidateHasWord =
      cluster.some((w) => candidateNorm === w || candidateNorm.includes(w)) ||
      cTokens.some((t) => cluster.includes(t));
    if (!candidateHasWord) continue;

    const queryHasWord =
      cluster.some((w) => queryNorm === w || queryNorm.includes(w)) ||
      qTokens.some((t) => cluster.includes(t));

    if (queryHasWord) {
      return 78;
    }
  }
  return -1;
}

/** Checks for minor typos (e.g. "groseris" -> "groceries", "resturant" -> "restaurants") */
function scoreTypoMatch(candidateNorm: string, queryNorm: string): number {
  const cTokens = candidateNorm.split(" ").filter((t) => t.length >= 4);
  const qTokens = queryNorm.split(" ").filter((t) => t.length >= 4);

  for (const q of qTokens) {
    for (const c of cTokens) {
      const maxEdits = Math.max(q.length, c.length) >= 7 ? 2 : 1;
      if (editDistance(q, c) <= maxEdits) {
        return 75;
      }
    }
  }
  return -1;
}

/**
 * Rank how well a candidate name matches a user-supplied query.
 * Returns a positive score when matched, -1 when not a match.
 */
export function scoreEntityMatch(name: string, query: string): number {
  const n = normalizeEntityName(name);
  const q = normalizeEntityName(query);
  if (!q || !n) return -1;
  if (n === q) return 100;
  if (n.startsWith(q)) return 90;
  if (n.includes(q)) return 80;

  // 1. Semantic concept cluster overlap (e.g. "haircut" -> user category "Self Care" or "Salon & Spa")
  const clusterScore = scoreDynamicClusterMatch(n, q);
  if (clusterScore > 0) return clusterScore;

  // 2. Minor typo / edit-distance match on custom categories (e.g. "groseris" -> "groceries")
  const typoScore = scoreTypoMatch(n, q);
  if (typoScore > 0) return typoScore;

  // 3. Multi-token overlap
  const qTokens = q.split(" ").filter(Boolean);
  if (qTokens.length > 1) {
    const matched = qTokens.filter((t) => n.includes(t)).length;
    if (matched === qTokens.length) return 70 + Math.min(qTokens.length, 5);
    return matched > 0 ? matched * 10 : -1;
  }
  return -1;
}

/** Pick ALL candidates tied at the highest score for a fuzzy name query. */
export function bestEntityMatches<T extends NamedEntity>(candidates: T[], query: string): T[] {
  let bestScore = 0;
  let best: T[] = [];
  for (const candidate of candidates) {
    const score = scoreEntityMatch(candidate.name, query);
    if (score <= 0) continue;
    if (score > bestScore) {
      bestScore = score;
      best = [candidate];
    } else if (score === bestScore) {
      best.push(candidate);
    }
  }
  return best;
}

/** Pick the highest-scoring candidate for a fuzzy name query. */
export function bestEntityMatch<T extends NamedEntity>(
  candidates: T[],
  query: string,
): T | undefined {
  return bestEntityMatches(candidates, query)[0];
}
