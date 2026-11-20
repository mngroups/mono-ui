import type { ExtraProps } from "react-markdown";

/**
 * Source of a fenced ```chart block, or `undefined` for any other `<pre>`.
 * react-markdown renders those blocks as `<pre><code class="language-chart">`,
 * so this reads the hast node the `pre` override receives.
 */
export function chartSource(node: ExtraProps["node"]): string | undefined {
  const code = node?.children[0];
  if (code?.type !== "element" || code.tagName !== "code") return undefined;
  const classes = code.properties.className;
  if (!Array.isArray(classes) || !classes.includes("language-chart")) return undefined;
  return code.children
    .map((child) => (child.type === "text" ? child.value : ""))
    .join("")
    .replace(/\n$/, "");
}
