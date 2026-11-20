import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MobileCardList } from "../mobile-card-list.js";
import { CardSummary, IdCell, MobileDataCard } from "../mobile-data-card.js";

describe("MobileDataCard", () => {
  it("folds rows and actions behind the header until expanded", () => {
    const onClick = vi.fn();
    render(
      <MobileDataCard
        testId="card"
        header={<CardSummary title="Site A" subtitle="Kontraktor" badge={<span>Aktif</span>} />}
        rows={[
          { label: "Kode", value: "A-1" },
          { label: "Catatan", value: "x".repeat(31) },
          { label: "Alamat", value: "baris 1\nbaris 2" },
          {
            label: "Daftar",
            value: [<span key="a">a</span>, <span key="b">b</span>],
          },
          { label: "Manual", value: <b>tumpuk</b>, stacked: true },
        ]}
        action={{ label: "Lihat", onClick, testId: "lihat" }}
      />
    );

    expect(screen.getByText("Site A")).toBeInTheDocument();
    expect(screen.getByText("Kontraktor")).toBeInTheDocument();
    expect(screen.queryByText("Kode")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Site A/ }));
    expect(screen.getByText("Kode").parentElement).toHaveClass("flex");
    expect(screen.getByText("Catatan").parentElement).toHaveClass("space-y-1");
    expect(screen.getByText("Alamat").parentElement).toHaveClass("space-y-1");
    expect(screen.getByText("Daftar").parentElement).toHaveClass("space-y-1");
    expect(screen.getByText("Manual").parentElement).toHaveClass("space-y-1");

    fireEvent.click(screen.getByTestId("lihat"));
    expect(onClick).toHaveBeenCalled();
  });

  it("lays 3+ actions in a grid with the odd one spanning both columns", () => {
    render(
      <MobileDataCard
        defaultOpen
        header={<CardSummary title="Site B" />}
        actions={[
          { label: "Satu", onClick: vi.fn() },
          { label: "Dua", onClick: vi.fn(), variant: "danger" },
          { label: "Tiga", onClick: vi.fn(), disabled: true, title: "Tidak bisa" },
        ]}
      />
    );

    expect(screen.getByRole("button", { name: "Satu" })).toHaveClass("min-w-0");
    expect(screen.getByRole("button", { name: "Dua" })).toHaveClass("hover:text-red-400");
    expect(screen.getByRole("button", { name: "Tiga" })).toHaveClass("col-span-2");
    expect(screen.getByRole("button", { name: "Tiga" })).toBeDisabled();
  });

  it("renders flat when not collapsible or without a body", () => {
    const { rerender } = render(
      <MobileDataCard
        testId="card"
        collapsible={false}
        header={<span>Header</span>}
        footer={<span>Footer</span>}
        className="extra"
      />
    );
    expect(screen.getByTestId("card")).toHaveClass("extra", "p-4");
    expect(screen.getByText("Footer")).toBeInTheDocument();

    rerender(<MobileDataCard testId="card" header={<span>Header</span>} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("IdCell", () => {
  it("renders a dash, the value, or a truncated value", () => {
    const { rerender, container } = render(<IdCell value={null} />);
    expect(container.textContent).toBe("-");

    rerender(<IdCell value="short" />);
    expect(screen.getByTitle("short")).toHaveTextContent("short");

    rerender(<IdCell value="abcdefghij" max={4} />);
    expect(screen.getByTitle("abcdefghij")).toHaveTextContent("abcd");
  });
});

describe("MobileCardList", () => {
  const items = Array.from({ length: 5 }, (_, i) => ({ id: `i${i}`, name: `Item ${i + 1}` }));
  const renderCard = (item: (typeof items)[number]) => <span>{item.name}</span>;
  const keyOf = (item: (typeof items)[number]) => item.id;

  it("shows skeletons while loading", () => {
    const { container } = render(
      <MobileCardList
        items={items}
        isLoading
        skeletonCount={2}
        renderCard={renderCard}
        keyOf={keyOf}
      />
    );
    expect(container.firstChild?.childNodes).toHaveLength(2);
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });

  it("shows the empty state without items", () => {
    render(<MobileCardList items={[]} renderCard={renderCard} keyOf={keyOf} />);
    expect(screen.getByText("Data belum tersedia")).toBeInTheDocument();
  });

  it("renders every item with a header when not paged", () => {
    render(
      <MobileCardList
        items={items}
        renderCard={renderCard}
        keyOf={keyOf}
        header={<span>Judul</span>}
        className="extra"
      />
    );
    expect(screen.getByText("Judul")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
  });

  it("slices client-side pages and forwards page changes", () => {
    const onChange = vi.fn();
    render(
      <MobileCardList
        items={items}
        renderCard={renderCard}
        keyOf={keyOf}
        pagination={{ total: 5, page: 2, pageSize: 2, onChange, clientSide: true }}
      />
    );
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
    expect(screen.getByText("Item 4")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Halaman berikutnya" })[0]);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("renders server-paged items as given", () => {
    render(
      <MobileCardList
        items={items}
        renderCard={renderCard}
        keyOf={keyOf}
        pagination={{ total: 20, page: 2, pageSize: 5, onChange: vi.fn() }}
      />
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();
  });
});
