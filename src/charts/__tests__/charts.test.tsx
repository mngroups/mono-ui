import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { buildNiceTicks, buildStepTicks } from "../build-ticks.js";
import { useChartDetailSheet } from "../chart-detail-sheet.js";
import { ChartTooltip } from "../chart-tooltip.js";
import { ComboChart } from "../combo-chart.js";
import { AXIS_TICK, TREND_CHART_DEFAULTS } from "../constants.js";
import { LegendChip } from "../legend-chip.js";
import { TrendLineChart } from "../trend-line-chart.js";
import { useChartReveal } from "../use-chart-reveal.js";

type ClickState = {
  activeLabel?: string;
  activePayload?: { dataKey?: string; value?: number | null; color?: string }[];
} | null;

const h = vi.hoisted(() => ({
  isMobile: false,
  inView: true,
  reduceMotion: false as boolean | null,
  onClick: undefined as undefined | ((s: unknown) => void),
  payload: [] as { dataKey?: string; value?: number | null; color?: string }[],
}));

vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => h.isMobile,
}));

vi.mock("motion/react", () => ({
  useInView: () => h.inView,
  useReducedMotion: () => h.reduceMotion,
}));

vi.mock("../../dynamic-modal/dynamic-modal.js", () => ({
  DynamicModal: ({
    open,
    onOpenChange,
    title,
    children,
  }: {
    open: boolean;
    onOpenChange: (o: boolean) => void;
    title: string;
    children: ReactNode;
  }) => (
    <div data-testid="sheet" data-open={String(open)}>
      <span>sheet:{title}</span>
      {children}
      <button type="button" onClick={() => onOpenChange(true)}>
        keep
      </button>
      <button type="button" onClick={() => onOpenChange(false)}>
        dismiss
      </button>
    </div>
  ),
}));

vi.mock("recharts", () => {
  const Chart = ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: (s: unknown) => void;
  }) => {
    h.onClick = onClick;
    return <div data-testid="chart">{children}</div>;
  };
  const Null = () => null;
  return {
    ResponsiveContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    ComposedChart: Chart,
    LineChart: Chart,
    CartesianGrid: Null,
    XAxis: Null,
    ReferenceLine: ({ y }: { y: number }) => <span data-testid="ref">{y}</span>,
    Cell: ({ fillOpacity }: { fillOpacity: number }) => (
      <span data-testid="cell">{fillOpacity}</span>
    ),
    YAxis: ({ tickFormatter }: { tickFormatter: (v: number) => string }) => (
      <span data-testid="ytick">{tickFormatter(7)}</span>
    ),
    Tooltip: ({ content }: { content: ReactElement | (() => ReactNode) }) => (
      <div data-testid="tooltip">
        {isValidElement(content)
          ? cloneElement(content as ReactElement<Record<string, unknown>>, {
              active: true,
              payload: h.payload,
              label: "Jan",
            })
          : (content as () => ReactNode)()}
      </div>
    ),
    Bar: ({ dataKey, children }: { dataKey: string; children: ReactNode }) => (
      <div data-testid={`bar-${dataKey}`}>{children}</div>
    ),
    Line: ({ dataKey, dot, children }: { dataKey: string; dot: unknown; children?: ReactNode }) => (
      <div data-testid={`line-${dataKey}`} data-dot={String(Boolean(dot))}>
        {children}
      </div>
    ),
    LabelList: ({ formatter }: { formatter: (v: number | null) => string }) => (
      <span data-testid="labels">
        [{formatter(null)}|{formatter(5)}]
      </span>
    ),
  };
});

beforeEach(() => {
  h.isMobile = false;
  h.inView = true;
  h.reduceMotion = false;
  h.onClick = undefined;
  h.payload = [];
});

const click = (s: ClickState) => {
  act(() => {
    h.onClick?.(s);
  });
};

describe("constants", () => {
  it("exposes the axis tick style", () => {
    expect(AXIS_TICK.fill).toBe(TREND_CHART_DEFAULTS.axisColor);
  });
});

describe("buildNiceTicks", () => {
  it("defaults to 0..1 without values", () => {
    expect(buildNiceTicks([]).domain).toEqual([0, 1]);
  });

  it("pads one step below a positive low value", () => {
    const { domain, ticks } = buildNiceTicks([10, 50]);
    expect(domain).toEqual([0, 50]);
    expect(ticks[0]).toBe(0);
  });

  it("returns no ticks for non-finite input (step factor fallback)", () => {
    expect(buildNiceTicks([Number.NaN]).ticks).toEqual([]);
  });

  it("keeps a zero low value without padding and honours min/max", () => {
    expect(buildNiceTicks([0, 30]).domain).toEqual([0, 30]);
    expect(buildNiceTicks([5], { min: 2, max: 8 }).domain).toEqual([2, 8]);
  });
});

describe("buildStepTicks", () => {
  it("reaches at least minMax and rounds up to a step", () => {
    expect(buildStepTicks([20], { step: 50, minMax: 100 }).ticks).toEqual([0, 50, 100]);
    expect(buildStepTicks([120], { step: 50, minMax: 100 }).domain).toEqual([0, 150]);
  });
});

describe("LegendChip", () => {
  it("renders square, dashed and line shapes", () => {
    const { container, rerender } = render(<LegendChip color="red" label="A" shape="square" />);
    expect(container.querySelector("svg")).toBeNull();
    rerender(<LegendChip color="red" label="A" shape="dashed" />);
    expect(container.querySelector("line")?.getAttribute("stroke-dasharray")).toBe("4 3");
    rerender(<LegendChip color="red" label="A" />);
    expect(container.querySelector("line")?.getAttribute("stroke-dasharray")).toBeNull();
  });
});

describe("ChartTooltip", () => {
  const labels = new Map([["a", "Alpha"]]);
  const formats = new Map([["a", (v: number) => `${v}%`]]);

  it("renders nothing when inactive or empty", () => {
    const { container, rerender } = render(
      <ChartTooltip labels={labels} formats={formats} payload={[{ dataKey: "a", value: 1 }]} />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<ChartTooltip active labels={labels} formats={formats} />);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <ChartTooltip active labels={labels} formats={formats} payload={[{ dataKey: "a" }]} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("formats entries, extras and falls back to String", () => {
    render(
      <ChartTooltip
        active
        labels={labels}
        formats={formats}
        payload={[{ dataKey: "a", value: 3 }]}
        extras={[{ dataKey: "b", value: 9 }]}
      />
    );
    expect(screen.getByText("3%")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("uses an empty label when none is given", () => {
    render(
      <ChartTooltip
        active
        labels={labels}
        formats={formats}
        payload={[{ dataKey: "a", value: 1 }]}
        labelFormatter={(l) => `L:${l}`}
      />
    );
    expect(screen.getByText("L:")).toBeInTheDocument();
  });
});

describe("useChartReveal", () => {
  it("shows when in view and animates without reduced motion", () => {
    const { result } = renderHook(() => useChartReveal());
    expect(result.current).toMatchObject({ show: true, animate: true });
  });

  it("treats an unknown reduced-motion preference as false", () => {
    h.inView = false;
    h.reduceMotion = null;
    const { result } = renderHook(() => useChartReveal());
    expect(result.current).toMatchObject({ show: false, animate: true });
  });

  it("shows at once with reduced motion", () => {
    h.inView = false;
    h.reduceMotion = true;
    const { result } = renderHook(() => useChartReveal());
    expect(result.current).toMatchObject({ show: true, animate: false });
  });
});

describe("useChartDetailSheet", () => {
  const labels = new Map([["a", "Alpha"]]);
  const formats = new Map<string, (v: number) => string>();

  it("uses default extras and label formatter on mobile clicks", () => {
    h.isMobile = true;
    const { result } = renderHook(() => useChartDetailSheet(labels, formats));
    act(() => {
      result.current.onChartClick({ activePayload: [{ dataKey: "a", value: 2 }] });
    });
    render(result.current.sheet);
    expect(screen.getByText("sheet:")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

const comboData = [
  { m: "Jan", plan: 100, actual: 80, pct: 80, partial: false },
  { m: "Feb", plan: 120, actual: "n/a", pct: 130, partial: true },
];

describe("ComboChart", () => {
  it("renders legend, both axes, bars, lines, dim cells and a reference line", () => {
    h.payload = [{ dataKey: "plan", value: 100, color: "red" }];
    render(
      <ComboChart
        data={comboData}
        xKey="m"
        bars={[
          { key: "plan", label: "Plan", color: "red" },
          { key: "actual", label: "Actual", color: "blue" },
        ]}
        lines={[{ key: "pct", label: "Pct", color: "green" }]}
        barFormatter={(v) => `${v} t`}
        lineFormatter={(v) => `${v}%`}
        lineScale={{ step: 50, minMax: 100 }}
        lineReference={100}
        minWidth={500}
        legendNote={<span>note</span>}
        dimKey="partial"
        dimLabel="Berjalan"
        className="extra"
      />
    );
    expect(screen.getByText("Berjalan")).toBeInTheDocument();
    expect(screen.getByText("note")).toBeInTheDocument();
    expect(screen.getAllByTestId("ytick").map((e) => e.textContent)).toEqual(["7 t", "7%"]);
    expect(screen.getByTestId("ref")).toHaveTextContent("100");
    expect(screen.getAllByTestId("cell").map((e) => e.textContent)).toEqual([
      "1",
      "0.4",
      "1",
      "0.4",
    ]);
    expect(screen.getByTestId("line-pct")).toBeInTheDocument();
    expect(screen.getByText("100 t")).toBeInTheDocument();
  });

  it("works with bars only, defaults, no legend and hidden series before reveal", () => {
    h.inView = false;
    render(
      <ComboChart
        data={comboData}
        xKey="m"
        bars={[{ key: "plan", label: "Plan", color: "red" }]}
        showLegend={false}
      />
    );
    expect(screen.queryByText("Plan")).toBeNull();
    expect(screen.queryByTestId("bar-plan")).toBeNull();
    expect(screen.getAllByTestId("ytick")).toHaveLength(1);
  });

  it("renders a single bar with auto-fit line axis and no reference", () => {
    render(
      <ComboChart
        data={comboData}
        xKey="m"
        bars={[{ key: "plan", label: "Plan", color: "red" }]}
        lines={[{ key: "pct", label: "Pct", color: "green" }]}
        dimKey="partial"
      />
    );
    expect(screen.getByTestId("bar-plan")).toBeInTheDocument();
    expect(screen.queryByTestId("ref")).toBeNull();
  });

  it("falls back to the axis colour for the dim chip without bars and skips it without dim rows", () => {
    const { rerender } = render(
      <ComboChart data={comboData} xKey="m" bars={[]} dimKey="partial" dimLabel="Dim" />
    );
    expect(screen.getByText("Dim")).toBeInTheDocument();
    rerender(
      <ComboChart data={[comboData[0]]} xKey="m" bars={[]} dimKey="partial" dimLabel="Dim" />
    );
    expect(screen.queryByText("Dim")).toBeNull();
  });

  it("opens the mobile detail sheet on click and suppresses the tooltip", async () => {
    h.isMobile = true;
    render(
      <ComboChart
        data={comboData}
        xKey="m"
        bars={[{ key: "plan", label: "Plan", color: "red" }]}
        labelFormatter={(l) => `Bulan ${l}`}
      />
    );
    expect(screen.getByTestId("tooltip")).toBeEmptyDOMElement();
    click(null);
    click({ activeLabel: "Jan" });
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "false");
    click({ activeLabel: "Jan", activePayload: [{ dataKey: "plan", value: 100, color: "red" }] });
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
    expect(screen.getByText("sheet:Bulan Jan")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "keep" }));
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "true");
    await userEvent.click(screen.getByRole("button", { name: "dismiss" }));
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "false");
  });

  it("ignores clicks on desktop", () => {
    render(
      <ComboChart data={comboData} xKey="m" bars={[{ key: "plan", label: "Plan", color: "r" }]} />
    );
    click({ activeLabel: "Jan", activePayload: [{ dataKey: "plan", value: 1 }] });
    expect(screen.getByTestId("sheet")).toHaveAttribute("data-open", "false");
  });

  it("opens the sheet without an active label", () => {
    h.isMobile = true;
    render(
      <ComboChart data={comboData} xKey="m" bars={[{ key: "plan", label: "Plan", color: "r" }]} />
    );
    click({ activePayload: [{ dataKey: "plan", value: 1 }] });
    expect(screen.getByText("sheet:")).toBeInTheDocument();
  });
});

const trendData = [
  { m: "Jan", a: 10, b: null },
  { m: "Feb", a: 20, b: 5 },
];

describe("TrendLineChart", () => {
  it("renders legend, reference lines, dots, labels and a tooltip with extras", () => {
    h.payload = [{ dataKey: "a", value: 10, color: "red" }];
    render(
      <TrendLineChart
        data={trendData}
        xKey="m"
        series={[
          { key: "a", label: "A", color: "red" },
          { key: "b", label: "B", color: "blue" },
        ]}
        referenceLines={[{ value: 15, label: "Target", color: "gray" }]}
        valueFormatter={(v) => `${v}u`}
        yTickFormatter={(v) => `y${v}`}
        yMin={0}
        yMax={30}
        className="x"
      />
    );
    expect(screen.getAllByText("Target").length).toBeGreaterThan(0);
    expect(screen.getByTestId("ytick")).toHaveTextContent("y7");
    expect(screen.getByTestId("line-a")).toHaveAttribute("data-dot", "true");
    expect(screen.getAllByTestId("labels")[0]).toHaveTextContent("[|5u]");
    expect(screen.getByText("15u")).toBeInTheDocument();
    expect(screen.getByTestId("ref")).toHaveTextContent("15");
  });

  it("drops dots and labels on dense data, hides legend and waits for reveal", () => {
    const dense = Array.from({ length: 20 }, (_, i) => ({ m: `d${i}`, a: i }));
    const { rerender } = render(
      <TrendLineChart
        data={dense}
        xKey="m"
        series={[{ key: "a", label: "A", color: "red" }]}
        showLegend={false}
      />
    );
    expect(screen.queryByText("A")).toBeNull();
    expect(screen.getByTestId("line-a")).toHaveAttribute("data-dot", "false");
    expect(screen.queryByTestId("labels")).toBeNull();

    h.inView = false;
    rerender(<TrendLineChart data={dense} xKey="m" series={[]} showLegend={false} />);
    expect(screen.queryByTestId("line-a")).toBeNull();
  });

  it("keeps labels off but dots on for medium-sized data", () => {
    const mid = Array.from({ length: 10 }, (_, i) => ({ m: `d${i}`, a: i }));
    render(<TrendLineChart data={mid} xKey="m" series={[{ key: "a", label: "A", color: "r" }]} />);
    expect(screen.getByTestId("line-a")).toHaveAttribute("data-dot", "true");
    expect(screen.queryByTestId("labels")).toBeNull();
  });

  it("opens the mobile sheet with reference rows", () => {
    h.isMobile = true;
    render(
      <TrendLineChart
        data={trendData}
        xKey="m"
        series={[{ key: "a", label: "A", color: "red" }]}
        referenceLines={[{ value: 15, label: "Target", color: "gray" }]}
      />
    );
    expect(screen.getByTestId("tooltip")).toBeEmptyDOMElement();
    click({ activeLabel: "Feb", activePayload: [{ dataKey: "a", value: 20 }] });
    expect(screen.getByText("sheet:Feb")).toBeInTheDocument();
    expect(screen.getAllByText("Target").length).toBeGreaterThan(1);
  });
});
