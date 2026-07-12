import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  avatarUrl: z.string().url().optional(),
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
