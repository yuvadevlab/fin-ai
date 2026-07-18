import { SYSTEM_PROMPT_TEMPLATE } from "./prompts.config";

export function buildSystemPrompt(context: string): string {
  return SYSTEM_PROMPT_TEMPLATE.replace("{context}", context);
}
