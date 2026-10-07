import { describe, it, expect } from "vitest";
import {
  buildAdvisorSystemPrompt,
  buildInsightSystemPrompt,
  buildPageInsightUserPrompt,
  buildEmojiSuggestionUserPrompt,
  buildTitleGenerationPrompt,
  sanitizeConversationTitle,
} from "../prompt-builder";
import { extractFollowUpQuestions } from "../extract-follow-ups";

describe("AI Engine (Unit Tests)", () => {
  describe("Prompt Builder", () => {
    it("should correctly replace context in advisor system prompt", () => {
      const context = "User has ₹50,000 in savings and an expense of ₹20,000";
      const prompt = buildAdvisorSystemPrompt(context);
      expect(prompt).toContain(context);
    });

    it("should correctly replace context in insight system prompt", () => {
      const context = "Dashboard showing 15% increase in spending";
      const prompt = buildInsightSystemPrompt(context);
      expect(prompt).toContain(context);
    });

    it("should resolve user prompt for a valid page insight", () => {
      const prompt = buildPageInsightUserPrompt("dashboard");
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(0);
    });

    it("should fallback to dashboard prompt for invalid page insight", () => {
      const prompt = buildPageInsightUserPrompt("invalid_page");
      const dashboardPrompt = buildPageInsightUserPrompt("dashboard");
      expect(prompt).toBe(dashboardPrompt);
    });

    it("should build emoji suggestion prompt correctly", () => {
      const category = "Groceries";
      const prompt = buildEmojiSuggestionUserPrompt(category);
      expect(prompt).toBe(`Category name: ${category}\nSuggested emoji:`);
    });

    it("should build title generation prompt correctly", () => {
      const prompt = buildTitleGenerationPrompt("Can you review my monthly grocery budget?");
      expect(prompt).toContain("Can you review my monthly grocery budget?");
      expect(prompt).toContain("3 to 6 word title");
    });

    it("should sanitize title and strip quotes, prefixes, and newlines", () => {
      expect(sanitizeConversationTitle('"Grocery Budget Review"', "fallback")).toBe(
        "Grocery Budget Review",
      );
      expect(sanitizeConversationTitle("Title: Expense Breakdown\nMore text", "fallback")).toBe(
        "Expense Breakdown",
      );
      expect(sanitizeConversationTitle("", "Default Title")).toBe("Default Title");
    });
  });

  describe("Follow-up Extraction", () => {
    it("should extract questions from standard header", () => {
      const text = `Here is your analysis.
### Follow-up Suggestions:
- How do I save more?
- What are my leaks?
- Can you check my budget?`;
      const questions = extractFollowUpQuestions(text);
      expect(questions).toEqual([
        "How do I save more?",
        "What are my leaks?",
        "Can you check my budget?",
      ]);
    });

    it("should handle different header variations", () => {
      const text = `Analysis complete.
### Suggested Next Steps:
1. Check Goals?
2. Review Expenses?
3. Analyze Portfolio?`;
      const questions = extractFollowUpQuestions(text);
      expect(questions).toEqual(["Check Goals?", "Review Expenses?", "Analyze Portfolio?"]);
    });

    it("should filter out short strings and non-questions", () => {
      const text = `...
### Follow-up Questions:
- Hi
- This is not a question
- Valid question?`;
      const questions = extractFollowUpQuestions(text);
      expect(questions).toEqual(["Valid question?"]);
    });

    it("should return empty array for text without follow-ups", () => {
      const text = "Just a regular AI response without suggestions.";
      expect(extractFollowUpQuestions(text)).toEqual([]);
    });

    it("should handle empty or null input", () => {
      expect(extractFollowUpQuestions("")).toEqual([]);
    });
  });
});
