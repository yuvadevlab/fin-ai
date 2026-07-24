"use client";

import React, { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@finai/ui";
import { Button } from "@finai/ui";
import { Smile } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface EmojiPickerFieldProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPickerField({ value, onChange }: EmojiPickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onEmojiClick = (emojiData: any) => {
    onChange(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full justify-start text-left font-normal hover:bg-transparent"
        >
          <span className="text-muted-foreground mr-2 text-sm">{value || "Select emoji"}</span>
          <Smile className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full border-none p-0 shadow-lg">
        <EmojiPicker theme={theme as Theme} onEmojiClick={onEmojiClick} autoFocusSearch={false} />
      </PopoverContent>
    </Popover>
  );
}
