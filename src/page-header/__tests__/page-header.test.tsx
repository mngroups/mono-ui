import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { PageHeader } from "../page-header.js";

describe("PageHeader", () => {
  it("renders the title, subtitle and the leading slot on top-level pages", () => {
    render(
      <PageHeader title="Fuel" subtitle="Ringkasan" className="extra" leading={<span>Menu</span>} />
    );
    expect(screen.getByRole("heading", { name: "Fuel" })).toBeInTheDocument();
    expect(screen.getByText("Ringkasan")).toBeInTheDocument();
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("links the back arrow to href with a plain anchor by default", () => {
    render(<PageHeader title="Detail" back={{ href: "/fuel", testId: "back" }} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/fuel");
    expect(screen.getByRole("button", { name: "Kembali" })).toBeInTheDocument();
  });

  it("renders href through a custom link component", () => {
    const Link = ({ href, children }: { href: string; children: ReactNode }) => (
      <a href={href} data-testid="custom-link">
        {children}
      </a>
    );
    render(<PageHeader title="Detail" back={{ href: "/fuel" }} linkComponent={Link} />);
    expect(screen.getByTestId("custom-link")).toHaveAttribute("href", "/fuel");
  });

  it("calls the back handler, or history.back without one", () => {
    const onClick = vi.fn();
    const { unmount } = render(<PageHeader title="Detail" back={{ onClick, label: "Balik" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Balik" }));
    expect(onClick).toHaveBeenCalled();
    unmount();

    const back = vi.spyOn(window.history, "back").mockImplementation(() => {});
    render(<PageHeader title="Detail" back={{}} />);
    fireEvent.click(screen.getByRole("button", { name: "Kembali" }));
    expect(back).toHaveBeenCalled();
    back.mockRestore();
  });

  it("keeps a single icon action inline", () => {
    const onClick = vi.fn();
    render(
      <PageHeader title="Fuel" actions={[{ label: "Tambah", onClick, variant: "primary" }]} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Tambah" }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByText("Tambah")).toHaveClass("hidden");
  });

  it("stacks several actions and drops hidden ones", () => {
    render(
      <PageHeader
        title="Fuel"
        actions={[
          { label: "Unduh", onClick: vi.fn(), mobile: "full", testId: "unduh" },
          { label: "Tambah", onClick: vi.fn(), mobile: "icon" },
          { label: "Hapus", onClick: vi.fn(), hidden: true },
        ]}
      >
        <span>Slot</span>
      </PageHeader>
    );

    expect(screen.getByText("Slot")).toBeInTheDocument();
    expect(screen.getByTestId("unduh")).toHaveClass("w-full");
    expect(screen.getByText("Tambah")).toHaveClass("hidden");
    expect(screen.queryByRole("button", { name: "Hapus" })).not.toBeInTheDocument();
  });

  it("renders the trailing slot with a single full-width action", () => {
    render(
      <PageHeader title="Fuel" actions={[{ label: "Unduh", onClick: vi.fn(), mobile: "full" }]}>
        <span>Slot</span>
      </PageHeader>
    );
    expect(screen.getByText("Unduh")).not.toHaveClass("hidden");
  });
});
