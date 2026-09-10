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

/**
 * Canonicalize a name for comparison: lowercase, separators (& , . _ / +
 * brackets # -) become spaces, whitespace collapsed.
 */
export function normalizeEntityName(value: string): string {
  return value.toLowerCase().replace(SEPARATOR_RE, " ").replace(/\s+/g, " ").trim();
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
  if (n.startsWith(q)) return 80;
  if (n.includes(q)) return 60;

  const qTokens = q.split(" ").filter(Boolean);
  if (qTokens.length > 1) {
    const matched = qTokens.filter((t) => n.includes(t)).length;
    if (matched === qTokens.length) return 70 + Math.min(qTokens.length, 5);
    return matched > 0 ? matched * 10 : -1;
  }
  return -1;
}

/**
 * Pick ALL candidates tied at the highest score for a fuzzy name query.
 */
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

/**
 * Pick the highest-scoring candidate for a fuzzy name query.
 */
export function bestEntityMatch<T extends NamedEntity>(
  candidates: T[],
  query: string,
): T | undefined {
  return bestEntityMatches(candidates, query)[0];
}
