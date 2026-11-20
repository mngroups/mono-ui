import { useWitaNow, useWitaToday, useWitaTodayDate } from "@mono/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";

function Demo() {
  const today = useWitaToday();
  const todayDate = useWitaTodayDate();
  const now = useWitaNow();
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-xl border border-border p-4 text-sm">
      <dt className="font-mono text-xs">useWitaToday()</dt>
      <dd className="font-mono text-xs text-primary">"{today}"</dd>
      <dt className="font-mono text-xs">useWitaTodayDate()</dt>
      <dd className="font-mono text-xs text-primary">{todayDate.toString()}</dd>
      <dt className="font-mono text-xs">useWitaNow()</dt>
      <dd className="font-mono text-xs text-primary">{now.toISOString()}</dd>
    </dl>
  );
}

const meta = {
  title: "Hooks/WITA time",
  parameters: {
    docs: {
      importPath: 'import { useWitaToday, useWitaTodayDate, useWitaNow } from "@mono/hooks";',
      description: {
        component: `Live WITA (\`Asia/Makassar\`) "today" and "now" for React. They recompute when the tab regains focus or visibility and on a light interval, so a page left open across WITA midnight moves to the new day instead of freezing at mount.

| Hook | Returns | Use for |
| --- | --- | --- |
| \`useWitaToday()\` | \`"YYYY-MM-DD"\` | Default date filters, API params |
| \`useWitaTodayDate()\` | Local-midnight \`Date\`; identity changes only when the WITA day turns over | Date pickers (\`maxDate\`, "today") |
| \`useWitaNow(enabled = true)\` | \`Date\` (current instant) | Periods that turn over at a time of day, e.g. 09:00 WITA |

The plain functions behind them are in [Utils → Dates (WITA)](?path=/docs/utils-dates-wita--docs).`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = { render: () => <Demo /> };
