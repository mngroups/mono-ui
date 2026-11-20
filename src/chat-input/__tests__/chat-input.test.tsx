import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ChatInput from "../chat-input.js";

describe("ChatInput", () => {
  it("sends trimmed text on Enter, ignores Shift+Enter and blank input", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const box = screen.getByPlaceholderText("Tanyakan pada OneMAP");

    await userEvent.type(box, "{Enter}");
    expect(onSend).not.toHaveBeenCalled();

    await userEvent.type(box, "  halo {Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.type(box, "{Enter}");
    expect(onSend).toHaveBeenCalledWith("halo");
    expect(box).toHaveValue("");

    fireEvent.keyDown(box, { key: "a" });
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("sends via the button and hides it for empty input", async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} placeholder="Tanya" />);
    expect(screen.queryByRole("button")).toBeNull();
    await userEvent.type(screen.getByPlaceholderText("Tanya"), "hai");
    await userEvent.click(screen.getByRole("button"));
    expect(onSend).toHaveBeenCalledWith("hai");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("does not send while disabled", () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} disabled seedKey={1} seedValue="seeded" />);
    const box = screen.getByPlaceholderText("Tanyakan pada OneMAP");
    expect(box).toBeDisabled();
    expect(box).toHaveValue("seeded");
    const send = screen.getByRole("button");
    expect(send).toBeDisabled();
    fireEvent.click(send);
    expect(onSend).not.toHaveBeenCalled();
  });

  it("shows a stop button while streaming and blocks Enter", async () => {
    const onSend = vi.fn();
    const onStop = vi.fn();
    const { rerender } = render(
      <ChatInput onSend={onSend} isStreaming disabled onStop={onStop} seedKey={1} />
    );
    const box = screen.getByPlaceholderText("Tanyakan pada OneMAP");
    expect(box).not.toBeDisabled();
    expect(box).toHaveValue("");
    await userEvent.type(box, "x{Enter}");
    expect(onSend).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Stop generating" }));
    expect(onStop).toHaveBeenCalled();

    rerender(<ChatInput onSend={onSend} isStreaming />);
    await userEvent.click(screen.getByRole("button", { name: "Stop generating" }));
  });

  it("resizes on window resize and cleans up on unmount", () => {
    const { unmount } = render(<ChatInput onSend={vi.fn()} />);
    fireEvent(window, new Event("resize"));
    const box = screen.getByPlaceholderText("Tanyakan pada OneMAP") as HTMLTextAreaElement;
    expect(box.style.height).toMatch(/px$/);
    unmount();
    fireEvent(window, new Event("resize"));
  });
});
