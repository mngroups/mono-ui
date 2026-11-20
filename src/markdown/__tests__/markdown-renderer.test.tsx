import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LinkPreview } from "../link-preview.js";
import { MarkdownRenderer } from "../markdown-renderer.js";

vi.mock("../chart-renderer.js", () => ({
  ChartRenderer: ({ raw }: { raw: string }) => <div data-testid="chart">{raw}</div>,
}));

describe("MarkdownRenderer", () => {
  it("renders a fenced ```chart block with ChartRenderer", () => {
    const md = ["Ringkasan", "", "```chart", "type: bar", "Senin=120", "```"].join("\n");
    const { container } = render(<MarkdownRenderer content={md} />);
    expect(screen.getByTestId("chart")).toHaveTextContent("type: bar Senin=120");
    expect(screen.getByTestId("chart").textContent).toBe("type: bar\nSenin=120");
    expect(container.querySelector("pre")).toBeNull();
  });

  it("renders headings, lists, quotes, code, tables and links", () => {
    const md = [
      "# H1",
      "## H2",
      "### H3",
      "#### H4",
      "##### H5",
      "",
      "Para with `inline` and [link](https://x.test)",
      "",
      "- item",
      "",
      "1. one",
      "",
      "> quote",
      "",
      "```",
      "block",
      "```",
      "",
      "| A | B |",
      "| - | - |",
      "| 1 | 2 |",
    ].join("\n");
    render(<MarkdownRenderer content={md} />);
    for (const level of [1, 2, 3, 4, 5]) {
      expect(screen.getByRole("heading", { level })).toHaveTextContent(`H${level}`);
    }
    expect(screen.getByRole("link", { name: "link" })).toHaveAttribute("target", "_blank");
    expect(screen.getByText("inline").tagName).toBe("CODE");
    expect(screen.getByText("item")).toBeInTheDocument();
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("quote").closest("blockquote")).not.toBeNull();
    expect(screen.getByText(/block/).closest("pre")).not.toBeNull();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "A" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2" })).toBeInTheDocument();
  });
});

describe("LinkPreview", () => {
  it("uses the child text, domain site name and favicon", () => {
    const { container } = render(
      <LinkPreview href="https://www.example.com/news/a-b">Judul</LinkPreview>
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://www.example.com/news/a-b");
    expect(screen.getByText("Example")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Judul" })).toBeInTheDocument();
    const img = container.querySelector("img") as HTMLImageElement;
    img.dispatchEvent(new Event("error"));
    expect(img.style.display).toBe("none");
  });

  it("derives a title from the URL slug when the child is the href", () => {
    const href = "https://site.com/news/bukit-asam_fokus-1234567.html";
    render(<LinkPreview href={href}>{href}</LinkPreview>);
    expect(screen.getByRole("heading", { name: "Bukit Asam Fokus" })).toBeInTheDocument();
  });

  it("falls back to the domain for short or missing slugs and non-string children", () => {
    const { rerender } = render(
      <LinkPreview href="https://site.com/ab">
        <span>x</span>
      </LinkPreview>
    );
    expect(screen.getByRole("heading", { name: "site.com" })).toBeInTheDocument();
    rerender(<LinkPreview href="https://site.com">{"https://site.com"}</LinkPreview>);
    expect(screen.getByRole("heading", { name: "site.com" })).toBeInTheDocument();
  });

  it("uses the raw href when it is not a URL", () => {
    render(<LinkPreview href="not a url">{"not a url"}</LinkPreview>);
    expect(screen.getByRole("heading", { name: "not a url" })).toBeInTheDocument();
    expect(screen.getByText("Not a url")).toBeInTheDocument();
  });
});
