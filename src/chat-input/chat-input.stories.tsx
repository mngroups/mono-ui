import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { ThinkingIndicator } from "../thinking-indicator/thinking-indicator.js";
import { Button } from "../ui/button.js";
import ChatInput from "./chat-input.js";

const meta = {
  title: "Components/ChatInput",
  component: ChatInput,
  parameters: {
    docs: { importPath: 'import { ChatInput } from "@mono/ui";' },
  },
  args: { onSend: fn(), onStop: fn(), placeholder: "Tanyakan pada OneMAP" },
  argTypes: {
    disabled: { control: "boolean" },
    isStreaming: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Type something: the send button appears. Enter sends, Shift+Enter adds a line. */
export const Default: Story = {};

/** While a reply streams, the send button becomes Stop and Enter does nothing. */
export const Streaming: Story = {
  args: { isStreaming: true },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Sesi chat berakhir" },
};

/** Suggestion chips: set `seedValue` and bump `seedKey` to fill and focus the input. */
export const SeededFromSuggestion: Story = {
  render: function Render(args) {
    const [seed, setSeed] = useState<{ value: string; key: number }>();
    const suggestions = [
      "Total produksi minggu ini",
      "Konsumsi fuel per unit",
      "Unit breakdown hari ini",
    ];
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <Button
              key={s}
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setSeed((prev) => ({ value: s, key: (prev?.key ?? 0) + 1 }))}
            >
              {s}
            </Button>
          ))}
        </div>
        <ChatInput {...args} seedValue={seed?.value} seedKey={seed?.key} />
      </div>
    );
  },
};

/** A small chat: sending shows the thinking indicator, then a canned reply. */
export const Conversation: Story = {
  render: function Render(args) {
    const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([
      { from: "ai", text: "Halo! Ada yang bisa dibantu soal data operasional?" },
    ]);
    const [thinking, setThinking] = useState(false);
    return (
      <div className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.from === "user"
                ? "self-end rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                : "self-start rounded-2xl bg-muted px-4 py-2 text-sm"
            }
          >
            {m.text}
          </div>
        ))}
        {thinking && <ThinkingIndicator label="Sedang berpikir…" />}
        <ChatInput
          {...args}
          isStreaming={thinking}
          onStop={() => setThinking(false)}
          onSend={(text) => {
            args.onSend(text);
            setMessages((prev) => [...prev, { from: "user", text }]);
            setThinking(true);
            setTimeout(() => {
              setThinking((still) => {
                if (still) {
                  setMessages((prev) => [
                    ...prev,
                    { from: "ai", text: "Produksi Site Sangatta minggu ini 12.480 ton." },
                  ]);
                }
                return false;
              });
            }, 1500);
          }}
        />
      </div>
    );
  },
};
