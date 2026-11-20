"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChartRenderer } from "./chart-renderer.js";
import { chartSource } from "./chart-source.js";

/**
 * Renders Markdown (with GitHub-flavoured tables, task lists and strikethrough) in the app's
 * typography, e.g. for chat answers. Links open in a new tab; tables and code blocks scroll
 * sideways inside their own frame; long words and URLs wrap.
 */
export function MarkdownRenderer({
  content,
}: {
  /** Markdown source. */
  content: string;
}) {
  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              className="break-all text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold wrap-break-word">{children}</h1>
          ),

          h2: ({ children }) => (
            <h2 className="text-xl font-semibold wrap-break-word">{children}</h2>
          ),

          h3: ({ children }) => (
            <h3 className="text-lg font-semibold wrap-break-word">{children}</h3>
          ),

          h4: ({ children }) => (
            <h4 className="text-base font-semibold wrap-break-word">{children}</h4>
          ),

          h5: ({ children }) => (
            <h5 className="text-sm font-semibold wrap-break-word">{children}</h5>
          ),

          p: ({ children }) => {
            const childArray = React.Children.toArray(children);

            if (childArray.some((child) => React.isValidElement(child) && child.type === "pre")) {
              return <>{children}</>;
            }

            return (
              <p className="leading-relaxed wrap-break-word whitespace-pre-wrap">{children}</p>
            );
          },

          ul: ({ children }) => (
            <ul className="list-disc space-y-2 pl-6 wrap-break-word">{children}</ul>
          ),

          ol: ({ children }) => (
            <ol className="list-decimal space-y-2 pl-6 wrap-break-word">{children}</ol>
          ),

          li: ({ children }) => <li className="wrap-break-word">{children}</li>,

          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-foreground/20 pl-4 text-muted-foreground italic">
              {children}
            </blockquote>
          ),

          pre: ({ node, children }) => {
            const chart = chartSource(node);
            if (chart !== undefined) return <ChartRenderer raw={chart} />;

            return (
              <div className="scrollbar-modern my-4 w-full max-w-full overflow-x-auto rounded-xl bg-foreground/5 p-4 text-sm">
                <pre className="w-max min-w-full">{children}</pre>
              </div>
            );
          },

          code: ({ children }) => (
            <code className="rounded bg-foreground/10 px-1 py-0.5 text-sm wrap-break-word">
              {children}
            </code>
          ),

          table: ({ children }) => (
            <div className="scrollbar-modern my-4 w-full max-w-full overflow-x-auto rounded-2xl border border-foreground/10">
              <table className="w-max min-w-full border-collapse text-sm">{children}</table>
            </div>
          ),

          thead: ({ children }) => (
            <thead className="bg-foreground/5 font-semibold text-foreground/80">{children}</thead>
          ),

          tbody: ({ children }) => (
            <tbody className="divide-y divide-foreground/10">{children}</tbody>
          ),

          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-foreground/5">{children}</tr>
          ),

          th: ({ children }) => (
            <th className="px-4 py-3 text-left whitespace-nowrap">{children}</th>
          ),

          td: ({ children }) => <td className="px-4 py-3 text-left wrap-break-word">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
