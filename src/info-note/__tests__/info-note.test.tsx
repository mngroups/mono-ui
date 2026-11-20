import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InfoNote } from "../info-note.js";

describe("InfoNote", () => {
  it("renders a tinted note with the description", () => {
    render(<InfoNote type="info" className="extra" description="Catatan penting" />);
    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("Catatan penting");
    expect(note).toHaveClass("extra");
    expect(note).toHaveAttribute("data-slot", "alert");
  });

  it("renders a title and a close button when closeable", () => {
    const onClose = vi.fn();
    render(<InfoNote title="Judul" description="Isi" closeable onClose={onClose} />);
    expect(screen.getByText("Judul")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
