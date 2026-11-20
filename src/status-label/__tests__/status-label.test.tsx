import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusLabel } from "../status-label.js";

describe("StatusLabel", () => {
  it("renders the label with an optional icon", () => {
    render(
      <StatusLabel tone="success" icon={<svg data-testid="icon" />} data-testid="badge">
        Berhasil
      </StatusLabel>
    );

    expect(screen.getByTestId("badge")).toHaveTextContent("Berhasil");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("darkens the text of coloured tones for contrast", () => {
    render(
      <StatusLabel tone="danger" data-testid="badge">
        Gagal
      </StatusLabel>
    );

    expect(screen.getByTestId("badge").className).toContain("text-red-700");
  });
});
