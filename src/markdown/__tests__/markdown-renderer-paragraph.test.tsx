import { render, screen } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { MarkdownRenderer } from "../markdown-renderer.js";

// react-markdown never hands `p` a <pre> child, so drive the `p` override
// directly to cover the pre-passthrough path.
vi.mock("react-markdown", () => ({
  default: ({ components }: { components: { p: ComponentType<{ children?: ReactNode }> } }) => {
    const P = components.p;
    return (
      <>
        <P>
          <pre>raw pre</pre>
        </P>
        <P>plain</P>
      </>
    );
  },
}));

vi.mock("../chart-renderer.js", () => ({
  ChartRenderer: ({ raw }: { raw: string }) => <div data-testid="chart">{raw}</div>,
}));

describe("MarkdownRenderer paragraph override", () => {
  it("passes <pre> through and wraps plain text", () => {
    const { container } = render(<MarkdownRenderer content="ignored" />);
    expect(screen.getByText("raw pre").parentElement?.tagName).not.toBe("P");
    expect(screen.getByText("plain").tagName).toBe("P");
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });
});
