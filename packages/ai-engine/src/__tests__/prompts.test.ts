import { describe, it, expect } from "vitest";
import {
  buildAdvisorSystemPrompt,
  buildInsightSystemPrompt,
  buildPageInsightUserPrompt,
  buildEmojiSuggestionUserPrompt,
} from "../prompt-builder";
import {
  buildTransactionParserPrompt,
  looksLikeTransactionMessage,
  TRANSACTION_PARSER_SYSTEM_PROMPT,
} from "../transaction-parser";
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

    it("should build a strict transaction parser prompt with live options", () => {
      const prompt = buildTransactionParserPrompt("I spent 100 for cake", ["Cash"], ["Dining"]);

      expect(prompt).toContain("I spent 100 for cake");
      expect(prompt).toContain("Cash");
      expect(prompt).toContain("Dining");
      expect(TRANSACTION_PARSER_SYSTEM_PROMPT).toContain("Never invent an amount");
    });

    it("should prefilter transaction-like statements without deciding ownership", () => {
      expect(looksLikeTransactionMessage("I spent 1000 on groceries")).toBe(true);
      expect(looksLikeTransactionMessage("How much did I spend this month?")).toBe(false);
      expect(looksLikeTransactionMessage("My friend spent 10000 for my birthday")).toBe(true);
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
