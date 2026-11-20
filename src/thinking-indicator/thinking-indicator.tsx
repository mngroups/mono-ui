interface ThinkingIndicatorProps {
  /** Status text under the dots, e.g. "Sedang berpikir…". */
  label: string;
}

/**
 * Chat "assistant is typing" bubble: three bouncing dots with a pulsing status label under it.
 * Show it while waiting for the first streamed token.
 */
export function ThinkingIndicator({ label }: ThinkingIndicatorProps) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex w-fit gap-1 rounded-2xl bg-foreground/10 px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" />
      </div>

      <span className="animate-pulse text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
