import { z } from "zod";
import { defineTool } from "../tool-factory";
import type { CategoriesService } from "@/modules/categories/categories.service";
import type { Category } from "@finai/shared-types";
import { createCategorySchema, updateCategorySchema } from "@finai/validation";
import { scoreEntityMatch } from "../entity-reference";

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
      name: "categories.list",
      description:
        "List the user's spending/income categories with their group and icon. Auto-seeds default categories for new users. Prefer reusing these categories over creating new ones.",
      access: "read",
      confirmation: "none",
      label: "Reviewing categories",
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
      name: "categories.resolve",
      description:
        "Resolve a vague category name (e.g. 'food', 'groceries', 'rent') to the user's actual category IDs using fuzzy matching ('groceries' matches 'Groceries & Supermarket'). Use this before creating budgets or re-categorizing transactions when the user refers to a category loosely.",
      access: "read",
      confirmation: "none",
      label: "Resolving category",
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
      name: "categories.create",
      description:
        "Create a new custom category for the user. Requires confirmation. Fields: name (max 50 chars), optional group name (defaults 'Variable Expenses'), optional icon name.",
      access: "write",
      confirmation: "required",
      label: "Creating category",
      invalidates: ["categories", "transactions", "budgets"],
      schema: createCategorySchema,
      execute: async (input, ctx) => categoriesService.createCategory(ctx.userId, input),
      serialize: (output) => {
        const category = output as Category;
        return { id: category.id, name: category.name, group: category.group };
      },
      describe: (input) => {
        const rows: [string, string][] = [["Name", input.name]];
        if (input.group) rows.push(["Group", input.group]);
        if (input.icon) rows.push(["Icon", input.icon]);
        return { type: "confirmation" as const, title: "Create category", rows };
      },
      summarize: (output) => `Created category ${(output as Category).name}`,
    }),
    defineTool({
      name: "categories.update",
      description:
        "Rename or restyle one of the user's categories. Requires confirmation. Only pass the fields that should change.",
      access: "write",
      confirmation: "required",
      label: "Updating category",
      invalidates: ["categories", "transactions", "budgets"],
      schema: updateCategorySchema.extend({
        categoryId: z.string().uuid("Invalid category ID"),
      }),
      execute: async (input, ctx) => {
        const { categoryId, ...changes } = input;
        return categoriesService.updateCategory(categoryId, ctx.userId, changes);
      },
      describe: (input) => {
        const rows: [string, string][] = [["Category ID", input.categoryId]];
        if (input.name !== undefined) rows.push(["Name", input.name]);
        if (input.group !== undefined) rows.push(["Group", input.group]);
        if (input.icon !== undefined) rows.push(["Icon", input.icon ?? "(none)"]);
        return { type: "confirmation" as const, title: "Update category", rows };
      },
      summarize: (output) => `Updated category ${(output as Category).name}`,
    }),
    defineTool({
      name: "categories.delete",
      description:
        "Permanently delete one of the user's categories. Requires confirmation. Fails if the category is still used by any transactions or budgets.",
      access: "write",
      confirmation: "required",
      label: "Deleting category",
      invalidates: ["categories", "transactions", "budgets"],
      schema: z.object({
        categoryId: z.string().uuid("Invalid category ID"),
      }),
      execute: async (input, ctx) => categoriesService.deleteCategory(input.categoryId, ctx.userId),
      describe: (input) => ({
        type: "confirmation" as const,
        title: "Delete category",
        rows: [
          ["Category ID", input.categoryId],
          ["Warning", "Permanent delete — only possible when the category is unused"],
        ],
      }),
      summarize: () => "Category deleted",
    }),
  ];
}
