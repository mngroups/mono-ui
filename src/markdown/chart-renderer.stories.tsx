import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChartRenderer } from "./chart-renderer.js";
import { ChartTooltip } from "./chart-tooltip.js";

const meta = {
  title: "Components/ChartRenderer",
  component: ChartRenderer,
  parameters: {
    docs: {
      importPath: 'import { ChartRenderer, parseChart } from "@mono/ui/markdown";',
      description: {
        component: `Draws a small chart from the plain-text chart format that chat answers use. Pass the text as \`raw\`; nothing renders when it has no data rows. Values are formatted Indonesian-style (\`1.234,5\`).

### Chart format

- \`type: bar | bar-stacked | line | area | pie\` on its own line (default \`bar\`).
- \`Label | key=value | key=value\` for a row with one or more series.
- \`Label=value\` for a single-series row (the series is called \`value\`; \`pie\` needs this form).
- Any other line is ignored.

### Helpers

- \`parseChart(raw)\` returns \`{ type, data }\`, e.g. \`parseChart("type: line\\nJan | a=1 | b=2")\` gives \`{ type: "line", data: [{ name: "Jan", a: 1, b: 2 }] }\`.
- \`ChartTooltip\` (from \`@mono/ui/markdown\`, not the one in \`@mono/ui/charts\`) is the Recharts tooltip these charts use. It picks a unit from each value and series name (e.g. ton, Rp) and formats the value with it. See the last example.`,
      },
    },
  },
  args: {
    raw: `type: bar
Site A | plan=12000 | aktual=12640
Site B | plan=9500 | aktual=9120
Site C | plan=7200 | aktual=6980`,
  },
  argTypes: { raw: { control: "text" } },
} satisfies Meta<typeof ChartRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `bar-stacked` stacks every series of a row into one bar. */
export const StackedBar: Story = {
  args: {
    raw: `type: bar-stacked
Sen | overburden=8200 | batubara=2100
Sel | overburden=7900 | batubara=2350
Rab | overburden=8600 | batubara=1980
Kam | overburden=8100 | batubara=2240`,
  },
};

export const Line: Story = {
  args: {
    raw: `type: line
M1 | siteA=1.42 | siteB=1.31
M2 | siteA=1.38 | siteB=1.35
M3 | siteA=1.29 | siteB=1.40
M4 | siteA=1.33 | siteB=1.27`,
  },
};

export const Area: Story = {
  args: {
    raw: `type: area
Jan=38500
Feb=41200
Mar=39800
Apr=44100
Mei=45600`,
  },
};

/** `pie` uses the single-value `Label=value` rows and labels each slice with value and share. */
export const Pie: Story = {
  args: {
    raw: `type: pie
PT Bara=182000
PT Tambang=154500
PT Karya=121300
PT Sinar=98700`,
  },
};

/** The markdown `ChartTooltip` on its own, as Recharts shows it on hover. */
export const Tooltip: Story = {
  render: () => (
    <div className="inline-block">
      <ChartTooltip
        active
        label="Site A"
        payload={[
          { dataKey: "plan", name: "plan", value: 12000, color: "#3087EF" },
          { dataKey: "aktual", name: "aktual", value: 12640, color: "#EC5E5E" },
        ]}
      />
    </div>
  ),
};
