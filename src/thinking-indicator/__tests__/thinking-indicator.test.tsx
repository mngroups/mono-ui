import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThinkingIndicator } from "../thinking-indicator.js";

describe("ThinkingIndicator", () => {
  it("renders the given label", () => {
    render(<ThinkingIndicator label="Sedang berpikir…" />);
    expect(screen.getByText("Sedang berpikir…")).toBeInTheDocument();
  });
});
