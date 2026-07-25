/**
 * Utility function to parse follow-up questions from AI message text.
 */
export function extractFollowUpQuestions(text: string): string[] {
  const match = text.match(/###\s*Follow-up Suggestions:\s*([\s\S]*)$/i);
  if (!match || !match[1]) return [];

  const rawList = match[1].trim();
  return rawList
    .split("\n")
    .map((line) => line.replace(/^[-*?•\d.]+\s*/, "").trim())
    .filter((q) => q.length > 3 && q.endsWith("?"));
}
