import { z } from "zod";

/** Shape of the persisted `User.preferences` Json column (see @finai/shared-types UserPreferences). */
export const userPreferencesSchema = z.object({
  notifications: z.record(z.boolean()).optional(),
  appearance: z.record(z.union([z.string(), z.boolean()])).optional(),
  security: z.record(z.boolean()).optional(),
  defaultAccountId: z.string().uuid("Invalid default account ID").optional(),
});

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  email: z.string().email("Please provide a valid email address").optional(),
  preferences: userPreferencesSchema.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  currency: z.string().length(3).optional(),
  locale: z.string().max(10).optional(),
  notifications: z
    .object({
      budgetAlerts: z.boolean().optional(),
      goalAlerts: z.boolean().optional(),
      aiInsights: z.boolean().optional(),
      weeklyReport: z.boolean().optional(),
    })
    .optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
