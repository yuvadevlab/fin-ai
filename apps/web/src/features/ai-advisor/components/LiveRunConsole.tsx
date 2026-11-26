"use client";

import { useMemo } from "react";
import { Terminal, TerminalEntryLevel, TerminalHeight, type TerminalEntry } from "@fin-ai/ui";
import type { AgentRunLogEntry } from "../api/agentTypes";
import { AgentRunLogLevel } from "@fin-ai/shared-types";
import { UI_COPY } from "@/lib/ui-copy";

interface LiveRunConsoleProps {
  logs?: AgentRunLogEntry[];
  isStreaming?: boolean;
  className?: string;
}

const LOG_LEVEL_MAP: Record<AgentRunLogLevel, TerminalEntryLevel> = {
  [AgentRunLogLevel.SYS]: TerminalEntryLevel.SYS,
  [AgentRunLogLevel.CTX]: TerminalEntryLevel.CTX,
  [AgentRunLogLevel.LLM]: TerminalEntryLevel.LLM,
  [AgentRunLogLevel.TOOL]: TerminalEntryLevel.TOOL,
  [AgentRunLogLevel.STREAM]: TerminalEntryLevel.INFO,
  [AgentRunLogLevel.ACTION]: TerminalEntryLevel.ACTION,
  [AgentRunLogLevel.DONE]: TerminalEntryLevel.DONE,
  [AgentRunLogLevel.ERR]: TerminalEntryLevel.ERR,
};

/**
 * Real-time agent execution console powered by `@fin-ai/ui` Terminal.
 * Displays live server-streamed telemetry entries with elapsed timestamps and copy support.
 */
export function LiveRunConsole({ logs = [], isStreaming = false, className }: LiveRunConsoleProps) {
  const entries = useMemo<TerminalEntry[]>(
    () =>
      logs.map((log) => ({
        id: log.id,
        elapsedMs: log.elapsedMs,
        level: LOG_LEVEL_MAP[log.level] ?? TerminalEntryLevel.SYS,
        message: log.message,
        detail: log.detail,
      })),
    [logs],
  );

  return (
    <Terminal
      className={className}
      command={UI_COPY.ADVISOR.LIVE_CONSOLE.TITLE}
      entries={entries}
      isStreaming={isStreaming}
      autoScroll
      emptyText={UI_COPY.ADVISOR.LIVE_CONSOLE.EMPTY}
      height={TerminalHeight.MD}
      windowControls={false}
    />
  );
}
