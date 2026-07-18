"use client";

import { useRef } from "react";
import { Send, Square } from "lucide-react";
import { Button, Input } from "@finai/ui";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isStreaming: boolean;
  onStop: () => void;
}

export function ChatInput({ value, onChange, onSubmit, isStreaming, onStop }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-border/80 bg-secondary/10 border-t p-4">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="Ask about your finances…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isStreaming}
          className="bg-background flex-1"
          autoComplete="off"
        />
        {isStreaming ? (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="shrink-0 rounded-lg"
            onClick={onStop}
            title="Stop generating"
          >
            <Square className="size-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            className="shrink-0 rounded-lg"
            disabled={!value.trim()}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
      {isStreaming && (
        <p className="text-muted-foreground mt-2 text-center text-[11px]">
          FinAI is responding · powered by Ollama
        </p>
      )}
    </div>
  );
}
