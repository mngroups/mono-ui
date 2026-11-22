# MoNo UI (`@mono/ui`)

The MoNo UI design system: React 19 components on top of [shadcn/ui](https://ui.shadcn.com) (Radix primitives + Tailwind v4), plus the design tokens and Tailwind v4 styles they need. Extracted from `mining-ops-fe` (`components/`).

## Install

The package is private in GitLab Package Registry. Copy `.npmrc.example` to `.npmrc` and set
`GITLAB_PACKAGE_GROUP_ID` plus a `GITLAB_NPM_TOKEN` with `read_package_registry` access. Then:

```bash
pnpm add @mono/ui @mono/hooks @mono/utils
```

Peer dependencies: `react` / `react-dom` ≥ 19. Install the optional peers only for the subpaths you use (see below). `react-hook-form` is needed for `Form`, `FloatingInput`, `FloatingSelect` and `FormDatePicker`.

## Consumer setup

### 1. CSS (order matters)

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css"; /* animate-in/out used by overlays */
@import "@mono/ui/styles.css"; /* tokens, @theme bridge, utilities, base */
@import "@mono/ui/theme-default.css"; /* MoNo brand (teal/blue); swap for your own tokens */

/* Tailwind must scan the package so its classes are generated. */
@source "../node_modules/@mono/ui/dist";
```

`styles.css` uses `@theme`, `@utility` and `@custom-variant`, so it has to come after `@import "tailwindcss"`. Dark mode is the `.dark` class on `<html>` (`ThemeProvider` from `@mono/hooks` sets it). To rebrand, write a file that overrides the variables in `theme-default.css` (`--brand`, `--brand-dark`, `--brand-soft`, `--brand-light`) and import it instead; `styles.css` maps them onto the shadcn tokens (`--primary`, `--accent`, `--ring`, …).

### 2. App-level wiring

```tsx
import { Toaster, UiConfigProvider } from "@mono/ui";

<UiConfigProvider mobileNavV2={isFeatureEnabled("mobileNavigationV2")}>
  {children}
  <Toaster theme={theme} />
</UiConfigProvider>;
```

`UiConfigProvider.mobileNavV2` switches the pinned mobile chrome of `DynamicModal` and `StickyFormFooter` (both also take a `mobileNavV2` prop that wins over the provider).

### 3. Vitest in the consuming app

```ts
// vitest.config.ts
test: {
  server: { deps: { inline: [/@mono\//] } },
}
```

Without it Vitest loads `@mono/*` untransformed from `node_modules`, and `vi.mock("next/navigation")` / `vi.mock("@mono/hooks")` don't reach their imports. Mock `@mono/hooks` partially so other hooks keep working:

```ts
vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => true,
}));
```

## Entry points

| Import                                      | Contents                                                                                                                                | Extra peers                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `@mono/ui`                                  | everything in the catalog below                                                                                                         | –                                                                                                   |
| `@mono/ui/charts`                           | `TrendLineChart`, `ComboChart`, `ChartTooltip`, `LegendChip`, `useChartDetailSheet`, `useChartReveal`, tick helpers                     | `recharts`                                                                                          |
| `@mono/ui/markdown`                         | `MarkdownRenderer`, `ChartRenderer`, `LinkPreview`, `parseChart`                                                                        | `react-markdown`, `remark-gfm`, `recharts`, `d3-scale`                                              |
| `@mono/ui/file-previewer`                   | `FilePreviewer` + file helpers (`getFileKind`, `downloadFile`, …)                                                                       | `@tanstack/react-query` (a `QueryClientProvider` above it), `pdfjs-dist`, `docx-preview`, `heic-to` |
| `@mono/ui/file-upload`                      | `FileUploadDropzone` (single / `multiple`, per-file upload state, `transformFile` + `preview` slots), `PreviewFileList`, `validateFile` | `@mono/hooks` (`/upload`); `@tanstack/react-query` for the "Lihat" previewer                        |
| `@mono/ui/styles.css`, `/theme-default.css` | styles (see setup)                                                                                                                      | `tailwindcss` v4, `tw-animate-css`                                                                  |

The package has no `next/*` imports, so it works in any React 19 app. Next.js specifics come in as props: `PageHeader`'s `linkComponent` (pass `next/link`) and `ScrollToTop`'s `resetKey` (pass the pathname).

## Catalog

| Group             | Components                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Buttons           | `PlainButton` (unstyled native button; use it instead of a raw `<button>`), `Button` (shadcn), `Toggle`                                                                                                                                                      |
| Forms             | `Form*` (react-hook-form), `Input`, `Textarea`, `Label`, `Checkbox`, `RadioGroup*`, `InputOTP`, `Select`, `Switch`, `FloatingInput`, `FloatingTextarea`, `FloatingSelect`, `FloatingMultiSelect`, `DynamicSelectList`, `StickyFormFooter`, `DraftFileNotice` |
| Dates             | `Calendar`, `DatePickerBase`, `FormDatePicker`, `DateRangePicker`, `YearPicker` (WITA-aware via `@mono/utils`)                                                                                                                                               |
| Overlays          | `DynamicModal` (vaul bottom sheet on mobile, dialog on desktop), `BottomSheet`, `Sheet`, `Popover`, `Tooltip`, `DropdownMenu`                                                                                                                                |
| Navigation        | `AppShell` (desktop sidebar; mobile bottom tab bar, max 5 tabs + Pengaturan; `filterAppShellMenu`), `MobileBottomNav`, `TabBar`, `Tabs`, `PageHeader`, `Sidebar*`, `Pagination`, `ListPagination`, `ScrollToTop`                                             |
| Data              | `DataTable` (`HorizonTable` is a deprecated alias), `BaseTable`, `Table*`, `MobileDataCard`, `MobileCardList`, `CardSummary`, `IdCell`, `ListToolbar`, `ListSearchInput`, `FilterDropdown` (`MultiSelectOptionDropdown`, `SingleSelectOptionDropdown`)       |
| Status & feedback | `StatusLabel`, `Badge`, `InfoNote`, `Alert*`, `Skeleton`, `TableSkeleton`, `TableEmptyState`, `EmptyData`, `DataNotAvailable`, `ThinkingIndicator`, `Toaster`, `toast`                                                                                       |
| Misc              | `Avatar*`, `Carousel*`, `Collapsible*`, `Separator`, `TipeOptionGroup`, `CountUp`, `GrowFill`, `ChatInput`, `GLASS_PANEL_STYLE`, `UiConfigProvider`                                                                                                          |

Rules carried over from the app:

- Loading states use `Skeleton` shimmer shaped like the real content, never a "Memuat…" string.
- Everything must work at 360px. One breakpoint, `md` (768px): prefer `max-md:`/`md:` utilities, and use `useIsMobile()` only when the tree differs.
- Copy is Indonesian by default.
- Compose classes with `cn()` from `@mono/utils`, never with `+`.

Browse the components in Storybook: `pnpm storybook` (toolbar: light/dark theme, mobile viewport).

## Development

Node 24 (`.nvmrc`), pnpm 10.

```bash
pnpm install
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build && pnpm storybook:build
```

- Source and tests live in `src/<component>/` with tests in `__tests__/`. Coverage is enforced at 100%.
- Relative imports carry the `.js` extension; the build is plain `tsc` (per-file ESM, `"use client"` kept), with CSS copied to `dist/styles/`.
- `pnpm-lock.yaml` resolves `@mono/utils@^0.2.0` and `@mono/hooks@^0.2.0` from the private GitLab
  Package Registry. Configure `.npmrc` as described above before installing.
- Commits: `<type>: <subject>` with `type` in `feat|fix|ai|ops|perf|refactor|test|chore|docs|change|remove` (no scope).

## Releasing

`pnpm release` (or `pnpm release:rc`) bumps the version, updates `CHANGELOG.md`, tags `v<version>` and pushes. The **Publish** workflow publishes the tag to this project's GitLab Package Registry (pre-releases go to the `next` dist-tag). Configure the GitHub Actions secret `GITLAB_NPM_TOKEN` and variables `GITLAB_PACKAGE_GROUP_ID` and `GITLAB_PACKAGE_PROJECT_ID` as described in `@mono/utils`'s README.
