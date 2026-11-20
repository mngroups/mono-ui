import type { ExtraProps } from "react-markdown";
import { describe, expect, it } from "vitest";

import { chartSource } from "../chart-source.js";

type Node = NonNullable<ExtraProps["node"]>;

const pre = (children: Node["children"]): Node => ({
  type: "element",
  tagName: "pre",
  properties: {},
  children,
});

const code = (className: unknown, children: Node["children"]): Node => ({
  type: "element",
  tagName: "code",
  properties: className === undefined ? {} : { className: className as string[] },
  children,
});

describe("chartSource", () => {
  it("returns the text of a ```chart block without the trailing newline", () => {
    const node = pre([code(["language-chart"], [{ type: "text", value: "type: bar\nA=1\n" }])]);
    expect(chartSource(node)).toBe("type: bar\nA=1");
  });

  it("ignores non-text children inside the code element", () => {
    const node = pre([
      code(
        ["language-chart"],
        [
          { type: "text", value: "A=1" },
          { type: "comment", value: "x" },
        ]
      ),
    ]);
    expect(chartSource(node)).toBe("A=1");
  });

  it.each([
    ["no node", undefined],
    ["an empty pre", pre([])],
    ["a text child", pre([{ type: "text", value: "raw" }])],
    ["a non-code element", pre([{ ...code(["language-chart"], []), tagName: "span" }])],
    ["a code block without a language", pre([code(undefined, [])])],
    ["another language", pre([code(["language-ts"], [])])],
  ])("returns undefined for %s", (_label, node) => {
    expect(chartSource(node)).toBeUndefined();
  });
});
