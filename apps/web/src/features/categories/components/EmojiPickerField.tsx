"use client";

import React, { useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@fin-ai/ui";
import { Button } from "@fin-ai/ui";
import { Smile } from "lucide-react";
import { useTheme } from "@/hooks";
import { UI_COPY } from "@/lib/ui-copy";

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
        <Button variant="outline" className="fn-emoji-picker-btn">
          <span className="fn-emoji-picker-val">{value || UI_COPY.CATEGORIES.SELECT_EMOJI}</span>
          <Smile className="fn-emoji-picker-icon" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        className="fn-emoji-picker-popover"
      >
        <div onWheel={(e) => e.stopPropagation()} className="fn-emoji-picker-wrap">
          <EmojiPicker
            theme={theme as Theme}
            onEmojiClick={onEmojiClick}
            autoFocusSearch={false}
            lazyLoadEmojis={true}
            width={320}
            height={380}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
