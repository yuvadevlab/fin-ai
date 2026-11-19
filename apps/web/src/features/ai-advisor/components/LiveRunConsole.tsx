"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button, cn } from "@fin-ai/ui";
import type { AgentRunLogEntry } from "../api/agentTypes";
import { UI_COPY } from "@/lib/ui-copy";

interface LiveRunConsoleProps {
  logs?: AgentRunLogEntry[];
  isStreaming?: boolean;
  className?: string;
}

const LEVEL_BADGES: Record<AgentRunLogEntry["level"], { label: string; modifier: string }> = {
  SYS: { label: "SYS", modifier: "fn-console-badge--sys" },
  CTX: { label: "CTX", modifier: "fn-console-badge--ctx" },
  LLM: { label: "LLM", modifier: "fn-console-badge--llm" },
  TOOL: { label: "TOOL", modifier: "fn-console-badge--tool" },
  STREAM: { label: "STREAM", modifier: "fn-console-badge--stream" },
  ACTION: { label: "ACTION", modifier: "fn-console-badge--action" },
  DONE: { label: "DONE", modifier: "fn-console-badge--done" },
  ERR: { label: "ERR", modifier: "fn-console-badge--err" },
};

function formatOffset(ms: number): string {
  const sec = (ms / 1000).toFixed(2);
  return `+${sec}s`;
}

export function LiveRunConsole({ logs = [], isStreaming = false, className }: LiveRunConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopy = async () => {
    const text = logs
      .map(
        (l) =>
          `[${formatOffset(l.elapsedMs)}] [${l.level}] ${l.message}${l.detail ? ` (${l.detail})` : ""}`,
      )
      .join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("fn-console", className)}>
      {/* Console toolbar */}
      <div className="fn-console-toolbar">
        <div className="fn-console-brand">
          <Terminal className="fn-console-icon" />
          <span className="fn-console-title">{UI_COPY.ADVISOR.LIVE_CONSOLE.TITLE}</span>
          {isStreaming && (
            <span className="fn-console-streaming-tag">
              <span className="fn-console-pulse-dot" />
              <span>{UI_COPY.ADVISOR.LIVE_CONSOLE.RUNNING}</span>
            </span>
          )}
        </div>
        <div className="fn-console-actions">
          <span className="fn-console-count">
            {UI_COPY.ADVISOR.LIVE_CONSOLE.EVENT_COUNT(logs.length)}
          </span>
          {logs.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="fn-console-copy-btn"
              onClick={handleCopy}
              title={UI_COPY.ADVISOR.LIVE_CONSOLE.COPY_TOOLTIP}
            >
              {copied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* Log stream output */}
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label={UI_COPY.ADVISOR.LIVE_CONSOLE.STREAM_LABEL}
        className="fn-console-stream"
      >
        {logs.length === 0 ? (
          <p className="fn-console-empty">{UI_COPY.ADVISOR.LIVE_CONSOLE.EMPTY}</p>
        ) : (
          logs.map((log) => {
            const badge = LEVEL_BADGES[log.level] ?? LEVEL_BADGES.SYS;
            return (
              <div key={log.id} className="fn-console-row">
                <span className="fn-console-time">{formatOffset(log.elapsedMs)}</span>
                <span className={cn("fn-console-badge", badge.modifier)}>{badge.label}</span>
                <span className="fn-console-msg">
                  {log.message}
                  {log.detail && <span className="fn-console-detail">[{log.detail}]</span>}
                </span>
              </div>
            );
          })
        )}
        {isStreaming && (
          <div className="fn-console-loading-indicator">
            <span className="fn-console-pulse-dot" />
            <span>{UI_COPY.ADVISOR.LIVE_CONSOLE.PROCESSING}</span>
          </div>
        )}
      </div>
    </div>
  );
}
