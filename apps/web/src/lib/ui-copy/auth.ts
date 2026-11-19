/**
 * @file apps/web/src/lib/ui-copy/auth.ts
 * @description Centralized UI copy strings for authentication and SSO handoff flows.
 * @module @fin-ai/web/lib/ui-copy/auth
 */

/**
 * User-facing copy dictionary for authentication pages and redirects.
 */
export const AUTH_COPY = {
  LOGIN: {
    TITLE: "Redirecting to DevLab SSO",
    DESCRIPTION:
      "Single Sign-On is required to access FinAI. You are being redirected to the DevLab Portal...",
    CONTINUE_BUTTON: "Continue to DevLab Portal \u2192",
  },
  REGISTER: {
    TITLE: "Redirecting to DevLab Registration",
    DESCRIPTION: "New user registration is managed centrally at DevLab Portal...",
  },
  FORGOT_PASSWORD: {
    TITLE: "Redirecting to Password Recovery",
    DESCRIPTION: "Password recovery is handled centrally via DevLab Portal...",
  },
  RESET_PASSWORD: {
    TITLE: "Redirecting to Reset Password",
    DESCRIPTION: "Password reset is handled centrally via DevLab Portal...",
  },
} as const;
