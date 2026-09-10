/**
 * Robust utility function to parse follow-up questions from AI message text.
 *
 * The advisor prompt instructs the model to end replies with a
 * "### Follow-up Suggestions:" section, but small models paraphrase the
 * header or format the list inconsistently — hence the lenient regex
 * (optional hyphen, several header wordings) and per-line cleanup below.
 * Used to split the answer into "main content" vs "follow-up chips" in the
 * UI; anything unmatched stays part of the visible markdown response.
 *
 * @returns Up to 3 cleaned follow-up questions, or an empty list when the
 * model produced no recognizable suggestions section.
 */
export function extractFollowUpQuestions(text: string): string[] {
  if (!text) return [];

  // Everything AFTER the follow-up header is candidate list content; the
  // header itself is dropped so questions can be rendered as UI chips.
  const match = text.match(
    /###\s*(?:Follow-?[uU]p|Suggested|Recommended)\s*(?:Suggestions|Questions|Next Steps|Follow-ups)?[:\s]*\n([\s\S]*)$/i,
  );
  if (!match || !match[1]) return [];

  const rawList = match[1].trim();
  return (
    rawList
      .split("\n")
      .map((line) =>
        line
          .replace(/^[-*•\d.]+\s*/, "") // remove bullets, numbers, asterisks
          .replace(/^["'`]|["'`]$/g, "") // remove surrounding quotes
          .trim(),
      )
      // A real question is longer than 5 chars and ends with "?" — filters out
      // stray markdown, headings, or half-written lines the model may emit.
      .filter((q) => q.length > 5 && q.endsWith("?"))
      .slice(0, 3)
  ); // Max 3 suggestions — matches the prompt's "2 to 3" contract
}
