/**
 * @file apps/api/src/modules/agent/utils/transfer-category.utils.ts
 * @description Automatic category resolution for transfers and credit card bill repayments.
 * @module @fin-ai/api/agent/utils/transfer-category
 */

import type { CategoriesService } from "@/modules/categories/categories.service";

/**
 * Resolves or auto-provisions a sensible category for transfer transactions.
 * When money is sent to a credit card, prefers "Credit Card Bill" / "Debt Repayment".
 * For general transfers, prefers "Transfer".
 *
 * @param categoriesService Categories management service.
 * @param userId Owning user identifier.
 * @param isCreditCard Whether the destination account is a credit card.
 * @returns Object containing the resolved category ID.
 */
export async function resolveTransferCategory(
  categoriesService: CategoriesService,
  userId: string,
  isCreditCard: boolean,
): Promise<{ id: string }> {
  const categories = await categoriesService.getCategories(userId);

  if (isCreditCard) {
    const ccCategory = categories.find((c) =>
      /credit\s*card|cc\s*bill|debt\s*repayment/i.test(c.name),
    );
    if (ccCategory) {
      return { id: ccCategory.id };
    }
  }

  const transferCategory = categories.find((c) => /transfer/i.test(c.name));
  if (transferCategory) {
    return { id: transferCategory.id };
  }

  // Gracefully fallback to first existing category or auto-create a clean "Transfer" category
  if (categories.length > 0) {
    return { id: categories[0].id };
  }

  const created = await categoriesService.createCategory(userId, {
    name: "Transfer",
    group: "Transfers",
    icon: "↔️",
  });
  return { id: created.id };
}
