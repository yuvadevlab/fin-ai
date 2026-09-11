"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { Button, cn } from "@finai/ui";
import type { AgentRunLogEntry } from "../api/agentTypes";

interface LiveRunConsoleProps {
  logs?: AgentRunLogEntry[];
  isStreaming?: boolean;
  className?: string;
}

const LEVEL_BADGES: Record<AgentRunLogEntry["level"], { label: string; className: string }> = {
  SYS: { label: "SYS", className: "text-zinc-400 bg-zinc-800/80 border-zinc-700/60" },
  CTX: { label: "CTX", className: "text-sky-400 bg-sky-950/80 border-sky-850" },
  LLM: { label: "LLM", className: "text-purple-400 bg-purple-950/80 border-purple-850" },
  TOOL: { label: "TOOL", className: "text-amber-400 bg-amber-950/80 border-amber-850" },
  STREAM: { label: "STREAM", className: "text-emerald-400 bg-emerald-950/80 border-emerald-850" },
  ACTION: { label: "ACTION", className: "text-blue-400 bg-blue-950/80 border-blue-850" },
  DONE: { label: "DONE", className: "text-teal-400 bg-teal-950/80 border-teal-850" },
  ERR: { label: "ERR", className: "text-rose-400 bg-rose-950/80 border-rose-850" },
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
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-zinc-800/90 bg-zinc-950 font-mono text-xs text-zinc-300 shadow-inner",
        className,
      )}
    >
      {/* Console toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3 py-1.5 text-[11px]">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-zinc-400" />
          <span className="font-semibold tracking-wider text-zinc-400 uppercase">
            Live Agent Log
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span>running</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500">
            {logs.length} event{logs.length === 1 ? "" : "s"}
          </span>
          {logs.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              onClick={handleCopy}
              title="Copy terminal logs"
            >
              {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
            </Button>
          )}
        </div>
      </div>

      {/* Log stream output */}
      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Agent live logs stream"
        className="max-h-56 min-h-24 scrollbar-thin scrollbar-thumb-zinc-800 space-y-1 overflow-y-auto p-2.5 select-text focus-visible:outline-none"
      >
        {logs.length === 0 ? (
          <p className="py-2 text-zinc-600 italic">No execution events recorded yet.</p>
        ) : (
          logs.map((log) => {
            const badge = LEVEL_BADGES[log.level] ?? LEVEL_BADGES.SYS;
            return (
              <div
                key={log.id}
                className="flex items-start gap-2 rounded px-1 py-0.5 font-mono leading-relaxed transition-colors hover:bg-zinc-900/50"
              >
                <span className="w-12 shrink-0 text-right text-[10px] text-zinc-500 select-none">
                  {formatOffset(log.elapsedMs)}
                </span>
                <span
                  className={cn(
                    "py-0.2 shrink-0 rounded border px-1 text-[9px] font-bold tracking-tight uppercase",
                    badge.className,
                  )}
                >
                  {badge.label}
                </span>
                <span className="min-w-0 flex-1 wrap-break-word text-zinc-200">
                  {log.message}
                  {log.detail && (
                    <span className="ml-1.5 text-[11px] text-zinc-400">[{log.detail}]</span>
                  )}
                </span>
              </div>
            );
          })
        )}
        {isStreaming && (
          <div className="flex animate-pulse items-center gap-2 px-1 text-[11px] text-zinc-500">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            <span>Processing next event…</span>
          </div>
        )}
      </div>
    </div>
  );
}
