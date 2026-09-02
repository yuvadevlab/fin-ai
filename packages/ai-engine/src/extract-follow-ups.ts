/**
 * Robust utility function to parse follow-up questions from AI message text.
 * Matches headers like:
 *   ### Follow-up Suggestions:
 *   ### Follow-up Questions:
 *   ### Suggested Next Steps:
 */
export function extractFollowUpQuestions(text: string): string[] {
  if (!text) return [];

  const match = text.match(
    /###\s*(?:Follow-?[uU]p|Suggested|Recommended)\s*(?:Suggestions|Questions|Next Steps|Follow-ups)?[:\s]*\n([\s\S]*)$/i,
  );
  if (!match || !match[1]) return [];

  const rawList = match[1].trim();
  return rawList
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-*•\d.]+\s*/, "") // remove bullets, numbers, asterisks
        .replace(/^["'`]|["'`]$/g, "") // remove surrounding quotes
        .trim(),
    )
    .filter((q) => q.length > 5 && q.endsWith("?"))
    .slice(0, 3); // Max 3 suggestions
}
