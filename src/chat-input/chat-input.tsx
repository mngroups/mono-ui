"use client";

import { cn } from "@mono/utils";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button.js";
import { Textarea } from "../ui/textarea.js";

interface ChatInputProps {
  /** Called with the trimmed message on Enter or the send button; the input then clears. */
  onSend: (message: string) => void;
  /** Disables typing and sending (ignored while `isStreaming`, so Stop stays usable). */
  disabled?: boolean;
  placeholder?: string;
  /** A reply is streaming: Enter does not send and the send button becomes a Stop button. */
  isStreaming?: boolean;
  /** Called by the Stop button while `isStreaming`. */
  onStop?: () => void;
  /** Text to put in the input (e.g. a suggested prompt); applied whenever `seedKey` changes. */
  seedValue?: string;
  /** Change this to (re)apply `seedValue` and focus the input. */
  seedKey?: number | string;
}

/**
 * Auto-growing chat prompt box with a round send button that appears once there is text, and a
 * Stop button while a reply streams. Enter sends, Shift+Enter adds a new line.
 */
export default function ChatInput({
  onSend,
  disabled,
  placeholder = "Tanyakan pada OneMAP",
  isStreaming = false,
  onStop,
  seedValue,
  seedKey,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (seedKey === undefined) return;
    setInput(seedValue ?? "");
    textareaRef.current?.focus();
  }, [seedKey, seedValue]);

  // Auto expand
  useEffect(() => {
    const adjustHeight = () => {
      /* v8 ignore if -- @preserve ref null-check: the textarea is always mounted while this effect runs */
      if (!textareaRef.current) return;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    adjustHeight();

    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [input]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isStreaming) return;
      if (input.trim()) {
        onSend(input.trim());
        setInput("");
      }
    }
  };

  return (
    <div className="flex w-full items-end gap-1.5 rounded-4xl border border-primary bg-transparent p-2.5 shadow-sm transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 md:gap-2">
      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "m-0 flex-1 resize-none overflow-hidden rounded-4xl border-none bg-transparent px-3 py-1.5 text-base leading-6 focus:ring-0 focus:outline-none md:py-2 dark:bg-transparent",
          "min-h-9 md:min-h-10"
        )}
        disabled={disabled && !isStreaming}
      />

      {isStreaming ? (
        <Button
          variant="outline"
          aria-label="Stop generating"
          title="Stop generating"
          className="m-0 flex h-9! w-9! shrink-0 cursor-pointer items-center justify-center rounded-full! bg-neutral-700! p-0! text-white! hover:bg-neutral-800! md:h-10! md:w-10!"
          onClick={() => onStop?.()}
        >
          <SquareIcon className="h-3 w-3 md:h-3.5 md:w-3.5" fill="currentColor" />
        </Button>
      ) : (
        input.trim() && (
          <Button
            className="m-0 flex h-9! w-9! shrink-0 cursor-pointer items-center justify-center rounded-full! p-0! md:h-10! md:w-10!"
            disabled={disabled || !input.trim()}
            onClick={() => {
              /* v8 ignore if -- @preserve the button is disabled (or not rendered) in exactly these cases */
              if (disabled || !input.trim()) return;
              onSend(input.trim());
              setInput("");
            }}
          >
            <ArrowUpIcon className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )
      )}

      {/* TODO: will add attachment and voice input later */}
      {/* <div className="flex justify-between">
        <Button variant="ghost" size="icon" className="rounded-full">
          <LucidePlus size={18} />
        </Button>

        {input.trim() ? (
          <Button
            size="icon"
            className="cursor-pointer rounded-full"
            onClick={() => {
              onSend(input.trim());
              setInput("");
            }}
          >
            <ArrowUpIcon size={18} />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="rounded-full">
            <LucideMic size={18} />
          </Button>
        )}
      </div> */}
    </div>
  );
}
