import { describe, it, expect } from "vitest";
import { normalizeMarkdownMath } from "./markdown-math.utils";

describe("normalizeMarkdownMath", () => {
  it("converts inline LaTeX math with multiplication and bold rupee currency", () => {
    const input = "$(3 \\times 36,331) + (12 \\times 81,331) = \\mathbf{₹10,85,965}$";
    const expected = "(3 × 36,331) + (12 × 81,331) = **₹10,85,965**";
    expect(normalizeMarkdownMath(input)).toBe(expected);
  });

  it("converts block LaTeX math with fractions and delimiters", () => {
    const input = "$$\\frac{1,00,000}{12} \\approx \\mathbf{₹8,333}$$";
    const result = normalizeMarkdownMath(input);
    expect(result).toContain("(1,00,000 / 12) ≈ **₹8,333**");
  });

  it("preserves standard dollar amounts without math operators", () => {
    const input = "You spent $50 on coffee and $1,200 on rent.";
    expect(normalizeMarkdownMath(input)).toBe(input);
  });

  it("converts common LaTeX symbols like \\pm, \\cdot, and \\times even if bare", () => {
    const input = "Expected return: 12% \\pm 2% and factor 5 \\times 10";
    const expected = "Expected return: 12% ± 2% and factor 5 × 10";
    expect(normalizeMarkdownMath(input)).toBe(expected);
  });

  it("converts arrows like \\rightarrow and \\to", () => {
    const input1 = "Emergency Fund Top-up: ₹10,000 / month \\rightarrow (Total: ₹1,20,000)";
    const expected1 = "Emergency Fund Top-up: ₹10,000 / month → (Total: ₹1,20,000)";
    expect(normalizeMarkdownMath(input1)).toBe(expected1);

    const input2 = "Wealth Building/Maternity: ₹21,331 / month \\rightarrow (Total: ₹2,55,972)";
    const expected2 = "Wealth Building/Maternity: ₹21,331 / month → (Total: ₹2,55,972)";
    expect(normalizeMarkdownMath(input2)).toBe(expected2);
  });

  it("handles empty or falsy strings gracefully", () => {
    expect(normalizeMarkdownMath("")).toBe("");
  });
});
