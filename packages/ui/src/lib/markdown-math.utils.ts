/**
 * Normalizes LaTeX / KaTeX math notation commonly produced by LLMs into
 * clean, readable Markdown and Unicode formatting.
 *
 * LLMs frequently output math wrapped in `$...$` or `$$...$$` with LaTeX commands
 * like `\times`, `\mathbf{...}`, `\text{...}`, and `\frac{...}{...}`.
 * When rendered in standard GFM Markdown, these appear as raw unrendered LaTeX.
 * This utility converts them to clean Unicode (e.g. `×`, `÷`, `≈`, bold `**...**`)
 * while preserving valid Markdown and currency signs.
 */
export function normalizeMarkdownMath(text: string): string {
  if (!text) return "";

  // 1. Process block math: $$ ... $$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, block: string) => {
    return `\n\n${convertLatexToMarkdown(block.trim())}\n\n`;
  });

  // 2. Process inline math: $ ... $
  // Matches $...$ that are not preceded/followed by digits (to avoid matching $50 or $100),
  // and contain at least one character that isn't a space.
  result = result.replace(/(?<![\\$\d])\$([^$\n]+?)\$(?!\d)/g, (_match, math: string) => {
    // If it looks like a single currency amount without math operators, keep it as currency
    if (/^\s*\d+(?:,\d+)*(?:\.\d+)?\s*$/.test(math)) {
      return `$${math}$`;
    }
    return convertLatexToMarkdown(math.trim());
  });

  // 3. Fallback for un-delimited LaTeX commands remaining in text (e.g. bare \times or \mathbf{...})
  result = convertLatexToMarkdown(result);

  return result;
}

/**
 * Transforms LaTeX commands and symbols into Unicode and Markdown.
 */
function convertLatexToMarkdown(latex: string): string {
  let s = latex;

  // Environments
  s = s.replace(/\\begin\{[a-zA-Z*]+\}/g, "");
  s = s.replace(/\\end\{[a-zA-Z*]+\}/g, "");

  // Spacing & delimiters
  s = s.replace(/\\left\s*([([{|])/g, "$1");
  s = s.replace(/\\right\s*([)\]}|])/g, "$1");
  s = s.replace(/\\[,;:!]/g, " ");
  s = s.replace(/\\quad/g, "  ");
  s = s.replace(/\\qquad/g, "    ");

  // Bold commands: \mathbf{...}, \boldsymbol{...}, \textbf{...} -> **...**
  s = replaceCommand(s, ["mathbf", "boldsymbol", "textbf"], (content) => `**${content}**`);

  // Text commands: \text{...}, \mathrm{...}, \operatorname{...}, \mathit{...} -> ...
  s = replaceCommand(s, ["text", "mathrm", "operatorname", "mathit"], (content) => content);

  // Fractions: \frac{a}{b} -> (a / b)
  s = replaceFractions(s);

  // Arrows
  s = s.replace(/\\(?:rightarrow|to)\b/g, "→");
  s = s.replace(/\\leftarrow\b/g, "←");
  s = s.replace(/\\Rightarrow\b/g, "⇒");
  s = s.replace(/\\Leftarrow\b/g, "⇐");
  s = s.replace(/\\leftrightarrow\b/g, "↔");
  s = s.replace(/\\Leftrightarrow\b/g, "⇔");
  s = s.replace(/\\uparrow\b/g, "↑");
  s = s.replace(/\\downarrow\b/g, "↓");

  // Math operators & symbols
  s = s.replace(/\\times\b/g, "×");
  s = s.replace(/\\cdot\b/g, "·");
  s = s.replace(/\\div\b/g, "÷");
  s = s.replace(/\\pm\b/g, "±");
  s = s.replace(/\\approx\b/g, "≈");
  s = s.replace(/\\leq?\b/g, "≤");
  s = s.replace(/\\geq?\b/g, "≥");
  s = s.replace(/\\neq\b/g, "≠");
  s = s.replace(/\\infty\b/g, "∞");
  s = s.replace(/\\%|\\percent\b/g, "%");

  return s;
}

/** Helper to replace \cmd{arg} handling nested braces */
function replaceCommand(
  text: string,
  commandNames: string[],
  transform: (arg: string) => string,
): string {
  const pattern = new RegExp(`\\\\(?:${commandNames.join("|")})\\{`, "g");
  let match: RegExpExecArray | null;
  let out = "";
  let lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    const startIndex = match.index;
    const argStart = pattern.lastIndex;
    let depth = 1;
    let i = argStart;

    while (i < text.length && depth > 0) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      i++;
    }

    if (depth === 0) {
      const argContent = text.slice(argStart, i - 1);
      out += text.slice(lastIndex, startIndex) + transform(argContent);
      lastIndex = i;
      pattern.lastIndex = i;
    } else {
      break;
    }
  }

  out += text.slice(lastIndex);
  return out;
}

/** Helper to replace \frac{num}{den} -> (num / den) */
function replaceFractions(text: string): string {
  const fracPattern = /\\frac\{/g;
  let match: RegExpExecArray | null;
  let out = "";
  let lastIndex = 0;

  while ((match = fracPattern.exec(text)) !== null) {
    const startIndex = match.index;
    const numStart = fracPattern.lastIndex;
    let depth = 1;
    let i = numStart;

    while (i < text.length && depth > 0) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      i++;
    }

    if (depth === 0 && text[i] === "{") {
      const numContent = text.slice(numStart, i - 1);
      const denStart = i + 1;
      depth = 1;
      let j = denStart;

      while (j < text.length && depth > 0) {
        if (text[j] === "{") depth++;
        else if (text[j] === "}") depth--;
        j++;
      }

      if (depth === 0) {
        const denContent = text.slice(denStart, j - 1);
        out += text.slice(lastIndex, startIndex) + `(${numContent} / ${denContent})`;
        lastIndex = j;
        fracPattern.lastIndex = j;
        continue;
      }
    }
    break;
  }

  out += text.slice(lastIndex);
  return out;
}
