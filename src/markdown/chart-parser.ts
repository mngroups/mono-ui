// biome-ignore-all lint/suspicious/noExplicitAny: parses free-form chart JSON from chat markdown
export type ChartType = "bar" | "bar-stacked" | "line" | "area" | "pie";

/**
 * Parses the plain-text chart format into `{ type, data }`: a `type: …` line (default `bar`),
 * `Label | key=value | …` rows, and `Label=value` rows (stored as `value`). Other lines are ignored.
 */
export function parseChart(raw: string) {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let type: ChartType = "bar";
  const data: any[] = [];

  for (const line of lines) {
    if (line.startsWith("type:")) {
      type = line.replace("type:", "").trim() as ChartType;
      continue;
    }

    if (line.includes("|")) {
      const [label, ...pairs] = line.split("|").map((s) => s.trim());
      const row: any = { name: label };

      for (const p of pairs) {
        const [k, v] = p.split("=").map((x) => x.trim());
        row[k] = Number(v);
      }

      data.push(row);
      continue;
    }

    if (line.includes("=")) {
      const [name, v] = line.split("=");
      data.push({ name: name.trim(), value: Number(v.trim()) });
    }
  }

  return { type, data };
}
