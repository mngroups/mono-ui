import { render, screen } from "@testing-library/react";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { parseChart } from "../chart-parser.js";
import { ChartRenderer } from "../chart-renderer.js";
import { ChartTooltip } from "../chart-tooltip.js";

const h = vi.hoisted(() => ({
  payload: [] as { dataKey?: string; name?: string; value?: unknown; color?: string }[],
}));

vi.mock("recharts", () => {
  const chart =
    (id: string) =>
    ({ children }: { children: ReactNode }) => <div data-testid={id}>{children}</div>;
  const Null = () => null;
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    BarChart: chart("bar-chart"),
    LineChart: chart("line-chart"),
    AreaChart: chart("area-chart"),
    PieChart: chart("pie-chart"),
    CartesianGrid: Null,
    XAxis: Null,
    Legend: Null,
    Cell: Null,
    YAxis: ({
      tickFormatter,
      domain,
    }: {
      tickFormatter: (v: number) => string;
      domain: number[];
    }) => (
      <span data-testid="ytick">
        {tickFormatter(1234.5)}/{domain.join(",")}
      </span>
    ),
    Tooltip: ({ content }: { content: ReactElement }) => (
      <div data-testid="tooltip">
        {isValidElement(content)
          ? cloneElement(content as ReactElement<Record<string, unknown>>, {
              active: true,
              payload: h.payload,
              label: "Jan",
            })
          : null}
      </div>
    ),
    Bar: ({ dataKey, stackId }: { dataKey: string; stackId?: string }) => (
      <span data-testid={`bar-${dataKey}`} data-stack={stackId ?? "none"} />
    ),
    Line: ({ dataKey }: { dataKey: string }) => <span data-testid={`line-${dataKey}`} />,
    Area: ({ dataKey }: { dataKey: string }) => <span data-testid={`area-${dataKey}`} />,
    Pie: ({
      label,
      children,
    }: {
      label: (p: { value?: unknown; percent?: unknown }) => string;
      children: ReactNode;
    }) => (
      <div data-testid="pie">
        <span>{label({ value: "x", percent: 0.5 })}</span>
        <span>{label({ value: 10, percent: 0.25 })}</span>
        <span>{label({ value: 20 })}</span>
        {children}
      </div>
    ),
  };
});

beforeEach(() => {
  h.payload = [];
});

describe("parseChart", () => {
  it("parses type, pipe rows, key=value rows and ignores other lines", () => {
    expect(parseChart("type: line\n\nJan | a=1 | b=2\nFeb=3\njust text")).toEqual({
      type: "line",
      data: [
        { name: "Jan", a: 1, b: 2 },
        { name: "Feb", value: 3 },
      ],
    });
  });

  it("defaults to bar", () => {
    expect(parseChart("").type).toBe("bar");
  });
});

describe("ChartRenderer", () => {
  it("renders nothing without data", () => {
    const { container } = render(<ChartRenderer raw="type: bar" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders grouped bars with a formatted y axis and missing keys as 0", () => {
    h.payload = [{ dataKey: "a", name: "a", value: 5, color: "red" }];
    render(<ChartRenderer raw={"Jan | a=4 | b=2\nFeb | a=10"} />);
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-a")).toHaveAttribute("data-stack", "none");
    expect(screen.getByTestId("ytick").textContent).toMatch(/^1\.234,5\/0,10$/);
    expect(screen.getByText("5 ton")).toBeInTheDocument();
  });

  it("stacks bars for bar-stacked", () => {
    render(<ChartRenderer raw={"type: bar-stacked\nJan | a=1 | b=2"} />);
    expect(screen.getByTestId("bar-b")).toHaveAttribute("data-stack", "stack");
  });

  it("renders line and area charts", () => {
    const { rerender } = render(<ChartRenderer raw={"type: line\nJan=1"} />);
    expect(screen.getByTestId("line-value")).toBeInTheDocument();
    rerender(<ChartRenderer raw={"type: area\nJan=1"} />);
    expect(screen.getByTestId("area-value")).toBeInTheDocument();
  });

  it("renders a pie with value/percent labels", () => {
    render(<ChartRenderer raw={"type: pie\nA=10\nB=20"} />);
    const pie = screen.getByTestId("pie");
    expect(pie).toHaveTextContent("10 (25%)");
    expect(pie).toHaveTextContent("20 ()");
  });
});

describe("markdown ChartTooltip", () => {
  it("renders nothing when inactive or without payload", () => {
    const { container, rerender } = render(<ChartTooltip active={false} payload={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ChartTooltip active />);
    expect(container).toBeEmptyDOMElement();
    rerender(<ChartTooltip active payload={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("skips non-numeric values and formats by unit", () => {
    render(
      <ChartTooltip
        active
        label="Mar"
        payload={[
          { dataKey: "x", name: "x", value: "n/a" as unknown as number },
          { dataKey: "cost", name: "cost", value: 1000, color: "red" },
        ]}
      />
    );
    expect(screen.getByText("Mar")).toBeInTheDocument();
    expect(screen.queryByText("x")).toBeNull();
    expect(screen.getByText("Rp 1.000")).toBeInTheDocument();
  });
});
