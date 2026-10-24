import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { Category } from "@finai/shared-types";
import {
  AgentCardType,
  AgentToolName,
  ConfirmationRowLabel,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@finai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS, AGENT_TOOL_TITLES } from "@finai/ai-engine";
import { createCategorySchema, updateCategorySchema } from "@finai/validation";
import { scoreEntityMatch } from "../../entity-reference";
import { TOOL_MESSAGES } from "../tool-messages.constants";

const INVALIDATES_CATEGORY_WRITES = [
  ToolInvalidationTag.CATEGORIES,
  ToolInvalidationTag.TRANSACTIONS,
  ToolInvalidationTag.BUDGETS,
];

/**
 * Read + write tools over the existing CategoriesService.
 *
 * `categories.resolve` is the model's fuzzy-name entry point: it returns the
 * top 5 scored matches so the model can pick the right ID before writing
 * anything, instead of guessing a category name that might duplicate one.
 */
export function createCategoriesTools(categoriesService: CategoriesService) {
  return [
    defineTool({
      name: AgentToolName.CATEGORIES_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.CATEGORIES_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.CATEGORIES_LIST],
      schema: z.object({}),
      execute: async (_input, ctx) => {
        const categories = await categoriesService.getCategories(ctx.userId);
        return { categories };
      },
      summarize: (output) => {
        const { categories } = output as { categories: Category[] };
        return `Retrieved ${categories.length} categor(y/ies)`;
      },
    }),
    defineTool({
      name: AgentToolName.CATEGORIES_RESOLVE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.CATEGORIES_RESOLVE],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.CATEGORIES_RESOLVE],
      schema: z.object({
        name: z.string().min(1, "Category name is required").max(100),
      }),
      execute: async (input, ctx) => {
        const categories = await categoriesService.getCategories(ctx.userId);
        const query = input.name.trim();
        const matches = categories
          .map((c) => ({ category: c, score: scoreEntityMatch(c.name, query) }))
          .filter((m) => m.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((m) => m.category);
        return { query: input.name, matches };
      },
      summarize: (output) => {
        const { matches } = output as { query: string; matches: Category[] };
        return matches.length > 0
          ? `Resolved '${output && (output as { query: string }).query}' to ${matches.length} match(es): ${matches.map((m) => m.name).join(", ")}`
          : `No category matched '${(output as { query: string }).query}'`;
      },
    }),
    defineTool({
      name: AgentToolName.CATEGORIES_CREATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.CATEGORIES_CREATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.CATEGORIES_CREATE],
      invalidates: INVALIDATES_CATEGORY_WRITES,
      schema: createCategorySchema,
      execute: async (input, ctx) => categoriesService.createCategory(ctx.userId, input),
      serialize: (output) => {
        const category = output as Category;
        return { id: category.id, name: category.name, group: category.group };
      },
      describe: (input) => {
        const rows: [string, string][] = [[ConfirmationRowLabel.NAME, input.name]];
        if (input.group) rows.push([ConfirmationRowLabel.GROUP, input.group]);
        if (input.icon) rows.push([ConfirmationRowLabel.ICON, input.icon]);
        return {
          type: AgentCardType.CONFIRMATION,
          title: AGENT_TOOL_TITLES[AgentToolName.CATEGORIES_CREATE],
          rows,
        };
      },
      summarize: (output) => TOOL_MESSAGES.CATEGORIES.CREATED((output as Category).name),
    }),
    defineTool({
      name: AgentToolName.CATEGORIES_UPDATE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.CATEGORIES_UPDATE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.CATEGORIES_UPDATE],
      invalidates: INVALIDATES_CATEGORY_WRITES,
      schema: updateCategorySchema.extend({
        categoryId: z.string().uuid("Invalid category ID"),
      }),
      execute: async (input, ctx) => {
        const { categoryId, ...changes } = input;
        return categoriesService.updateCategory(categoryId, ctx.userId, changes);
      },
      describe: (input) => {
        const rows: [string, string][] = [[ConfirmationRowLabel.CATEGORY_ID, input.categoryId]];
        if (input.name !== undefined) rows.push([ConfirmationRowLabel.NAME, input.name]);
        if (input.group !== undefined) rows.push([ConfirmationRowLabel.GROUP, input.group]);
        if (input.icon !== undefined)
          rows.push([ConfirmationRowLabel.ICON, input.icon ?? "(none)"]);
        return {
          type: AgentCardType.CONFIRMATION,
          title: AGENT_TOOL_TITLES[AgentToolName.CATEGORIES_UPDATE],
          rows,
        };
      },
      summarize: (output) => `Updated category ${(output as Category).name}`,
    }),
    defineTool({
      name: AgentToolName.CATEGORIES_DELETE,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.CATEGORIES_DELETE],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.REQUIRED,
      label: AGENT_TOOL_LABELS[AgentToolName.CATEGORIES_DELETE],
      invalidates: INVALIDATES_CATEGORY_WRITES,
      schema: z.object({
        categoryId: z.string().uuid("Invalid category ID"),
      }),
      execute: async (input, ctx) => categoriesService.deleteCategory(input.categoryId, ctx.userId),
      describe: (input) => ({
        type: AgentCardType.CONFIRMATION,
        title: AGENT_TOOL_TITLES[AgentToolName.CATEGORIES_DELETE],
        rows: [
          [ConfirmationRowLabel.CATEGORY_ID, input.categoryId],
          [
            ConfirmationRowLabel.WARNING,
            "Permanent delete — only possible when the category is unused",
          ],
        ],
      }),
      summarize: () => "Category deleted",
    }),
  ];
}
