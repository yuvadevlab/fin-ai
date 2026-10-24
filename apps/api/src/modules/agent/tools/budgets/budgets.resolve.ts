/**
 * @file apps/api/src/modules/agent/tools/budgets.resolve.ts
 * @description Category and budget reference resolution helper for FinAI agent.
 * @module @finai/api/agent/tools/budgets-resolve
 */

import { BadRequestException } from "@nestjs/common";
import type { BudgetsService } from "@/modules/budgets/budgets.service";
import type { CategoriesService } from "@/modules/categories/categories.service";
import { resolveCategoryRef, splitRef } from "../../entity-reference";

export async function resolveBudgetMatch(
  budgetsService: BudgetsService,
  categoriesService: CategoriesService,
  userId: string,
  refStr?: string | null,
) {
  if (!refStr) throw new BadRequestException("A budget ID or category name is required");
  const ref = splitRef(refStr) ?? { name: refStr };
  const budgets = await budgetsService.findAll(userId);
  let match = ref.id ? budgets.find((b) => b.id === ref.id) : undefined;
  if (!match) {
    const category = await resolveCategoryRef(categoriesService, userId, ref);
    match = budgets.find((b) => b.categoryId === category.id);
  }
  if (!match) {
    throw new BadRequestException(
      `No budget found matching "${refStr}". List budgets with budgets.list or create one with budgets.create.`,
    );
  }
  return match;
}
