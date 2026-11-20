import { useEffect, useState } from "react";

/** Re-renders when `.dark` toggles on <html>, so live token values stay current. */
function useThemeVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const observer = new MutationObserver(() => setVersion((v) => v + 1));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return version;
}

function readVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export type Token = {
  /** CSS custom property, e.g. `--primary`. */
  name: string;
  /** Tailwind utility that uses it, e.g. `bg-primary`. */
  utility?: string;
  description?: string;
};

/** Grid of colour swatches resolved from the live CSS variables. */
export function ColorTokens({ tokens }: { tokens: Token[] }) {
  useThemeVersion();
  return (
    <div className="mono-docs-not-prose my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tokens.map((token) => (
        <div
          key={token.name}
          className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground"
        >
          <div
            className="h-16 border-b border-border"
            style={{ background: `var(${token.name})` }}
          />
          <div className="space-y-1 p-3 text-sm">
            <div className="font-mono font-semibold">{token.name}</div>
            {token.utility && (
              <div className="font-mono text-xs text-muted-foreground">{token.utility}</div>
            )}
            <div className="font-mono text-xs text-muted-foreground">{readVar(token.name)}</div>
            {token.description && <p className="text-muted-foreground">{token.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

const HEADINGS = ["h1", "h2", "h3", "h4", "h5"] as const;

/** The `--heading-*` scale, rendered with the package's `.heading-hN` classes. */
export function TypeScale() {
  useThemeVersion();
  return (
    <div className="mono-docs-not-prose my-6 divide-y divide-border rounded-xl border border-border bg-background text-foreground">
      {HEADINGS.map((level) => (
        <div key={level} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 p-4">
          <div className="w-40 shrink-0 font-mono text-xs text-muted-foreground">
            .heading-{level}
            <br />
            {readVar(`--heading-${level}-size`)} / {readVar(`--heading-${level}-leading`)}
          </div>
          <div className={`heading-${level}`}>Produksi harian naik 4%</div>
        </div>
      ))}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 p-4">
        <div className="w-40 shrink-0 font-mono text-xs text-muted-foreground">
          text-sm (body)
          <br />
          0.875rem / 1.25rem
        </div>
        <p className="text-sm">
          Data diperbarui setiap 15 menit. Fuel ratio stabil di seluruh site.
        </p>
      </div>
    </div>
  );
}

const RADII = [
  { label: "rounded-sm", className: "rounded-sm" },
  { label: "rounded-md", className: "rounded-md" },
  { label: "rounded-lg", className: "rounded-lg" },
  { label: "rounded-xl", className: "rounded-xl" },
  { label: "rounded-full", className: "rounded-full" },
];

/** Radius scale derived from `--radius`. */
export function RadiusScale() {
  return (
    <div className="mono-docs-not-prose my-6 flex flex-wrap gap-6">
      {RADII.map((radius) => (
        <div key={radius.label} className="flex flex-col items-center gap-2">
          <div className={`size-20 border-2 border-primary bg-accent ${radius.className}`} />
          <span className="font-mono text-xs text-muted-foreground">{radius.label}</span>
        </div>
      ))}
    </div>
  );
}

const SPACING = [1, 2, 3, 4, 6, 8, 12, 16];

/** Tailwind spacing steps used across components (4px base). */
export function SpacingScale() {
  return (
    <div className="mono-docs-not-prose my-6 space-y-2">
      {SPACING.map((step) => (
        <div key={step} className="flex items-center gap-4">
          <span className="w-16 font-mono text-xs text-muted-foreground">{step}</span>
          <div className="h-3 rounded-sm bg-primary" style={{ width: `${step * 4}px` }} />
          <span className="font-mono text-xs text-muted-foreground">{step * 4}px</span>
        </div>
      ))}
    </div>
  );
}
