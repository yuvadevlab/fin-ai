/**
 * @file apps/web/src/lib/ui-copy/common.ts
 * @description Universal, reusable action labels, status badges, and accessibility text.
 * @module @finai/web/lib/ui-copy/common
 */

export const COMMON_COPY = {
  ACTIONS: {
    CANCEL: "Cancel",
    SAVE: "Save Changes",
    SUBMIT: "Submit",
    DELETE: "Delete",
    CLOSE: "Close",
    EDIT: "Edit",
    BACK: "Go Back",
    REFRESH: "Refresh",
    COPY: "Copy",
    COPIED: "Copied!",
    DOWNLOAD: "Download",
    CLEAR: "Clear",
    OPEN: "Open",
    HIDE: "Hide",
    SHOW: "Show",
    SAVING: "Saving...",
    LOADING: "Loading...",
    SELECT_OPTION: "Select option...",
    CONFIRM: "Confirm",
    REJECT: "Reject",
    STOP: "Stop",
    SEND: "Send",
  },
  STATUS: {
    ONLINE: "Online",
    OFFLINE: "Offline",
    CONNECTED: "Connected",
    DISCONNECTED: "Disconnected",
    READY: "Ready",
    RUNNING: "Running",
    ERROR: "Error",
    SUCCESS: "Success",
    PENDING: "Pending",
    STREAMING: "Streaming",
  },
  THEME: {
    LIGHT: "Light",
    DARK: "Dark",
    SYSTEM: "System",
  },
  A11Y: {
    TOGGLE_THEME: "Toggle color theme",
    CLOSE_DIALOG: "Close dialog",
    CLEAR_OUTPUT: "Clear output",
    JUMP_TO_LATEST: "Jump to latest message",
    DELETE_ITEM: "Delete item",
    OPEN_MENU: "Open menu",
    EXPAND_SECTION: "Expand section",
    COLLAPSE_SECTION: "Collapse section",
  },
  ERROR: {
    GENERIC_FAILURE: "Something went wrong. Please try again.",
    NETWORK_DISCONNECTED: "Network connection lost. Reconnecting...",
    UNAUTHORIZED: "Session expired. Please log in again.",
  },
} as const;
