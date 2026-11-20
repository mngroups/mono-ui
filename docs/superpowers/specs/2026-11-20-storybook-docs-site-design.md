# Storybook as the `@mono/ui` documentation site

Date: 2026-11-20 · Status: draft, awaiting approval

## Intent

Turn the package's Storybook into the documentation site that **other developers** use to adopt `@mono/ui`: find the right component, see its variants live, copy a working snippet, and read its props. It should look and feel like a modern design-system site (shadcn/ui, Radix, Polaris-style), branded as MoNo, not like a default Storybook.

Today Storybook is a dev-only visual check: default Storybook chrome, 5 grab-bag story files in `src/stories/` (Primitives, Data, Charts, Overlays, Feedback), no docs pages, no props tables, `@storybook/addon-docs` not installed.

## Goals

- Every public export that renders UI (≈60 components across the root entry and the `charts`, `markdown`, `file-previewer` subpaths) has its own docs page in the first delivery.
- Each component page shows, in this order: title, one-paragraph description, import line (with the correct entry point), primary live example, "show code" with copy, further examples (variants, sizes, states), and an auto-generated props table.
- Getting-started and foundations pages: Introduction, Installation & consumer setup (CSS order, app wiring, Vitest), Colors (tokens, light/dark), Typography (heading scale), Radius/spacing, and the house rules from the README (skeleton loading, 360px / `md` breakpoint, Indonesian copy, `cn()`).
- MoNo-branded chrome: logo/wordmark, brand teal `#0097b2` as accent, clean typography, light and dark manager themes.
- Light/dark toggle and mobile (360px) viewport keep working in every preview.

## Non-goals

- Hosting/deploying the built site (Chromatic, GitHub Pages, etc.). The output stays `pnpm storybook` / `pnpm storybook:build`; deployment can be a follow-up.
- Changing component code or behaviour. JSDoc comments on components and props may be added/edited (comments only).
- Visual regression or interaction testing.
- A separate docs framework (Docusaurus, Next.js).

## Anti-goals

- Docs that drift from the code: props must come from TypeScript, not hand-written tables.
- Breaking CI: `lint`, `typecheck`, `test:coverage` (100%), `build`, `storybook:build` must all still pass.
- Leaking story/docs code into the published npm package.
- Copy that contradicts the README rules (e.g. a "Loading…" string instead of a skeleton).

## Constraints

- Storybook 9.1.x with `@storybook/react-vite`; Tailwind v4 via `@tailwindcss/vite` in `viteFinal`.
- `*.stories.tsx` anywhere under `src/` is already excluded from `tsconfig.build.json` and from coverage; `index.ts` files excluded from coverage. MDX files are not touched by `tsc`.
- Biome lints the repo; new files must pass `biome check`.
- `@mono/utils` / `@mono/hooks` are linked from sibling repos via `pnpm.overrides`; `viteFinal` dedupes React.
- Node 24, pnpm 10. Docs text in **English** (repo convention); example copy inside components stays Indonesian, as the app does.
- Components needing providers (react-hook-form `Form*`, `FilePreviewer` needs a `QueryClientProvider`, `Toaster`/`toast`, `Sidebar*` provider) must be wrapped per story, not globally, so other stories stay realistic.

## Approaches considered

1. **Storybook autodocs + one custom docs page template + MDX for intro/foundations** — _chosen._ One colocated `*.stories.tsx` per component, `tags: ["autodocs"]`, a shared `DocsPage` layout set in `preview.tsx` (`parameters.docs.page`), descriptions from JSDoc, props from TypeScript via react-docgen. Least effort per component, props can't drift. Trade-off: every page shares one layout; a component that needs long-form guidance gets an extra MDX page.
2. **Hand-written MDX page per component** — most freedom for narrative ("when to use X vs Y"), but 60 manual files, slower, and drifts as props change.
3. **Separate docs site** — rejected: adds a second system while Storybook already exists and is built in CI.

The user picked approach 1.

## Design

### Packages & config

- Add `@storybook/addon-docs` (version matching `storybook` 9.1.x) to devDependencies and `addons` in `.storybook/main.ts`.
- `stories` globs: `../src/**/*.mdx` and `../src/**/*.stories.tsx`.
- `typescript.reactDocgen: "react-docgen-typescript"` so props from the forwarded shadcn/Radix types show up (verify the default `react-docgen` is not enough first; keep the cheaper one if it is).
- New `.storybook/manager.ts` + `.storybook/theme.ts`: `create({ base, brandTitle: "MoNo UI", brandImage, colorPrimary/colorSecondary: brand teal, fontBase, appBg, … })`. Manager follows the OS light/dark preference.
- `.storybook/manager-head.html` / `preview-head.html` only if needed for the font.
- Sidebar order via `parameters.options.storySort`: `Introduction`, `Getting started`, `Foundations`, then component groups.

### Information architecture (sidebar)

```
Introduction
Getting started / Installation · Consumer setup · Testing with Vitest
Foundations / Colors · Typography · Radius & spacing · Guidelines
Components /
  Buttons · Forms · Dates · Overlays · Navigation · Data · Status & feedback · Misc
Charts            (@mono/ui/charts)
Markdown          (@mono/ui/markdown)
File previewer    (@mono/ui/file-previewer)
```

Groups match the README catalog. Story title: `Components/Forms/Floating Input`, etc. Related exports are documented on one page (e.g. `RadioGroup` + `RadioGroupItem`, `Alert*`, `Table*`, `Form*`, `Avatar*`, `Carousel*`, `Collapsible*`, `Sidebar*`, `FilterDropdown` + its two option dropdowns, `DataTable` + deprecated `HorizonTable` noted). The exact page list is the builder's to derive from `src/index.ts` and the three subpath `index.ts` files; every exported UI component must land on some page. Non-visual exports (hooks, helpers like `buildTicks`, `getFileKind`, `parseChart`, `GLASS_PANEL_STYLE`) are documented as a short section on the page of the component they serve, not as separate pages.

### Component page template

A custom `DocsPage` (`.storybook/docs/DocsPage.tsx`) built from `@storybook/addon-docs/blocks`:

1. `Title` + `Description` (from component JSDoc, falling back to `parameters.docs.description.component`).
2. **Import** block: a code line with the right entry point, from a `parameters.docs.importPath` string per story file (e.g. `import { Button } from "@mono/ui"`, `import { TrendLineChart } from "@mono/ui/charts"`).
3. `Primary` story in a `Canvas` with source shown on toggle and copy.
4. `Stories` (remaining examples) with headings.
5. `Controls`/`ArgTypes` props table for the main component only.

Styled to match the brand: generous whitespace, rounded canvas with subtle border, readable max-width.

### Stories

- One colocated file per page: `src/<folder>/<name>.stories.tsx` (e.g. `src/ui/button.stories.tsx`, `src/data-table/data-table.stories.tsx`).
- The first story uses `args` so Controls work; further stories show variants, sizes, states (disabled, loading skeleton, error, empty), and mobile where the component differs at 360px.
- **Mobile examples on docs pages (decided by user):** every component whose tree changes via `useIsMobile()` (at least `DatePickerBase`/`FormDatePicker`, `Popover`, `Tooltip`, `YearPicker`, `Sidebar`, `FilterDropdown`, `ChartDetailSheet`, `ListToolbar`, `FloatingSelect`, `FloatingMultiSelect`, `PageHeader`; the builder confirms the full list by grepping `useIsMobile`) gets a dedicated `Mobile` story rendered in its own iframe on the docs page (`parameters.docs.story: { inline: false, iframeHeight }`) inside a 360px-wide frame, so desktop and mobile are visible side by side on the page. The viewport toolbar still works in single-story view.
- **Props tables for grouped exports (decided by user):** only the page's main component gets a props table. Sub-exports (`TableRow`, `FormField`, `SidebarMenu`, `AlertTitle`, `RadioGroupItem`, …) appear in the examples and source only; no `subcomponents` tables.
- Realistic Indonesian sample data (mining-ops flavoured, like the existing stories).
- Existing `src/stories/*.stories.tsx` are migrated into the new per-component files and the folder is deleted.

### Foundations pages (MDX in `src/docs/`)

- **Colors**: swatches rendered from the live CSS variables (`--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, brand vars…), showing the token name, the Tailwind class, and the resolved value; reacts to the dark toggle.
- **Typography**: the `--heading-*` scale rendered live, plus body text.
- **Radius & spacing**: `--radius` scale.
- **Guidelines**: the README rules.
- **Getting started** pages reuse the README's install/setup content (README stays the source; docs may copy it).

Docs-only helper components (color swatches, type scale, import block, `DocsPage`) live under `.storybook/`, never under `src/`, so they don't compile into `dist/` or count against the 100% coverage threshold. _(Builder's call, settled in design review.)_

### Preview

- Keep the existing theme toolbar and viewports. The toolbar's initial value follows the OS `prefers-color-scheme`, so manager chrome and preview match on first load. _(Settled in design review.)_ Docs mode follows the same theme toggle (canvas background `bg-background`).
- Per-story providers via decorators (Form → `useForm` wrapper, FilePreviewer → `QueryClientProvider`, Toaster mounted for toast stories, Sidebar → `SidebarProvider`).

## Left to the builder

- Exact grouping of each export into pages, consistent with the IA above.
- Which examples each page shows beyond the primary one.
- Font choice for the docs chrome (system UI stack is acceptable) and the brand mark (a simple text/SVG wordmark is acceptable; no logo asset exists in the repo).
- Whether `react-docgen` or `react-docgen-typescript` is needed.
- Adding/editing JSDoc on components where descriptions are missing.

## Done when

- `pnpm storybook` shows the branded site with the IA above; every exported UI component reachable from the sidebar with a working docs page (import line, live example with copyable code, props table).
- Light/dark works on docs pages and stories; mobile-variant components show a 360px example on their docs page; the mobile viewport toolbar works in single-story view.
- `pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm storybook:build` passes; `dist/` contains no story/docs code.

## Revision: Horizon-style site (2026-11-20, decided by user)

The user asked for the look of the Horizon docs (horizon-docs-sqe Storybook). This supersedes the IA, template and styling above:

- **Sidebar** is flat, alphabetical: `Introduction` (Getting Started, Guidelines), `Design Tokens` (Colors, Typography, Radius & Spacing), `Theme` (Customizing), `Components/<ComponentName>`; subpath components (charts, markdown, file-previewer) also live under `Components`, their import line names the subpath.
- **Mode toolbar** `Light / Dark / System`, remembered in localStorage; the manager chrome, docs blocks (themed `DocsContainer`) and components all switch live.
- **Chrome**: neutral palette (`#f9fafc` / `#d5dbe5` / `#29313b`), radius 6, Inter + JetBrains Mono, MoNo teal as accent.
- **Docs page**: Storybook's standard block order, plus the import line; custom docs CSS reduced to wrapper padding, list markers and the 360px mobile frame. MDX pages are plain Markdown separated by rules.
- **Accessibility** tab via `@storybook/addon-a11y`.

Also decided by user: the primitive `Input`, `Textarea` and `SelectTrigger` share the `Floating*` look (48px, `rounded-xl`, `border-border`, `px-4`, `text-sm`, primary border on focus, no ring/shadow). `Input` and `SelectTrigger` take `size="sm"` (36px, `rounded-lg`, `px-3`) for dense places.
