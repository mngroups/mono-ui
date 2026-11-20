import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PlainButton } from "../plain-button.js";

describe("PlainButton", () => {
  it("passes the native click event to onClick", () => {
    const onClick = vi.fn();
    render(<PlainButton onClick={onClick}>Go</PlainButton>);

    fireEvent.click(screen.getByRole("button", { name: "Go" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toHaveProperty("currentTarget");
  });

  it("lets onClick stop the event reaching a parent", () => {
    const parent = vi.fn();
    render(
      <div onClick={parent}>
        <PlainButton onClick={(e) => e.stopPropagation()}>Go</PlainButton>
      </div>
    );

    fireEvent.click(screen.getByRole("button", { name: "Go" }));

    expect(parent).not.toHaveBeenCalled();
  });

  it("submits its form by default, like a native <button>", () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PlainButton>Save</PlainButton>
      </form>
    );

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit with type=button", () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PlainButton type="button">Toggle</PlainButton>
      </form>
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
