export const NOTIFICATIONS_COPY = {
  TITLE: "Notifications",
  ALL_CAUGHT_UP: "All caught up",
  MARK_ALL_READ: "Mark all as read",
  EMPTY_DESC: "You have no new notifications right now.",
  UNREAD_COUNT: (count: number) => `${count} unread`,
  INVITATION_TITLE: "Workspace Invitation",
  INVITATION_ACTION: "Review & Respond",
  SYSTEM_UPDATE: "System Alert",
  ASSISTANT_READY: "FinAI Assistant Ready",
  ASSISTANT_READY_DESCRIPTION:
    "Your personal AI advisor is ready to analyze your cash flow and give insights.",
} as const;
