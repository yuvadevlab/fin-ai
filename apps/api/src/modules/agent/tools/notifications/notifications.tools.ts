/**
 * @file apps/api/src/modules/agent/tools/notifications/notifications.tools.ts
 * @description Agent tools for querying and managing user notifications and alerts.
 * @module @fin-ai/api/agent/tools/notifications
 */

import { z } from "zod";
import { defineTool } from "../../tool-factory";
import type { NotificationsService } from "@/modules/notifications/services/notifications.service";
import {
  AgentToolName,
  ToolAccessLevel,
  ToolConfirmationType,
  ToolInvalidationTag,
} from "@fin-ai/shared-types";
import { AGENT_TOOL_DESCRIPTIONS, AGENT_TOOL_LABELS } from "@fin-ai/ai-engine";

/**
 * Creates notification inspection and maintenance tools for the agent runtime.
 *
 * @param notificationsService Active notifications service instance.
 * @returns Array of registered AgentTool instances.
 */
export function createNotificationsTools(notificationsService: NotificationsService) {
  return [
    defineTool({
      name: AgentToolName.NOTIFICATIONS_LIST,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.NOTIFICATIONS_LIST],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.NOTIFICATIONS_LIST],
      schema: z.object({
        limit: z.number().int().positive().max(50).default(20),
      }),
      execute: async (input, ctx) =>
        notificationsService.getUserNotifications(ctx.userId, input.limit),
      summarize: (output) => {
        const notifications = output as { id: string; title: string; isRead: boolean }[];
        const unread = notifications.filter((n) => !n.isRead).length;
        return `${notifications.length} notification(s) retrieved (${unread} unread)`;
      },
    }),
    defineTool({
      name: AgentToolName.NOTIFICATIONS_UNREAD_COUNT,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.NOTIFICATIONS_UNREAD_COUNT],
      access: ToolAccessLevel.READ,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.NOTIFICATIONS_UNREAD_COUNT],
      schema: z.object({}),
      execute: async (_input, ctx) => notificationsService.getUnreadCount(ctx.userId),
      summarize: (output) => {
        const { count } = output as { count: number };
        return `${count} unread notification(s)`;
      },
    }),
    defineTool({
      name: AgentToolName.NOTIFICATIONS_MARK_ALL_READ,
      description: AGENT_TOOL_DESCRIPTIONS[AgentToolName.NOTIFICATIONS_MARK_ALL_READ],
      access: ToolAccessLevel.WRITE,
      confirmation: ToolConfirmationType.NONE,
      label: AGENT_TOOL_LABELS[AgentToolName.NOTIFICATIONS_MARK_ALL_READ],
      invalidates: [ToolInvalidationTag.NOTIFICATIONS],
      schema: z.object({}),
      execute: async (_input, ctx) => notificationsService.markAllAsRead(ctx.userId),
      summarize: (output) => {
        const { count } = output as { count: number };
        return `Marked ${count} notification(s) as read`;
      },
    }),
  ];
}
