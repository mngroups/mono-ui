import { create } from "storybook/theming";

/**
 * Storybook chrome (sidebar, toolbar, docs blocks) in a neutral palette with the
 * MoNo brand as accent. Brand values mirror src/styles/theme-default.css.
 */
type Palette = {
  primary: string;
  surface: string;
  surfaceSecondary: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
};

const LIGHT: Palette = {
  primary: "#0097b2",
  surface: "#ffffff",
  surfaceSecondary: "#f9fafc",
  border: "#d5dbe5",
  text: "#29313b",
  textSecondary: "#677485",
  textMuted: "#8490a1",
  textInverse: "#ffffff",
};

const DARK: Palette = {
  primary: "#009cdf",
  surface: "#1e252e",
  surfaceSecondary: "#29313b",
  border: "#3b4552",
  text: "#f9fafc",
  textSecondary: "#bac3d1",
  textMuted: "#8490a1",
  textInverse: "#1e252e",
};

const FONT_SANS = '"Inter", ui-sans-serif, system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", ui-monospace, monospace';

function build(p: Palette, base: "light" | "dark") {
  return create({
    base,
    brandTitle: "MoNo UI",
    brandUrl: "./",
    brandImage: "./mono-ui-logo.png",
    brandTarget: "_self",
    colorPrimary: p.primary,
    colorSecondary: p.primary,
    appBg: p.surfaceSecondary,
    appContentBg: p.surface,
    appPreviewBg: p.surface,
    appBorderColor: p.border,
    appBorderRadius: 6,
    textColor: p.text,
    textInverseColor: p.textInverse,
    textMutedColor: p.textMuted,
    barTextColor: p.textSecondary,
    barHoverColor: p.primary,
    barSelectedColor: p.primary,
    barBg: p.surface,
    inputBg: p.surface,
    inputBorder: p.border,
    inputTextColor: p.text,
    inputBorderRadius: 6,
    fontBase: FONT_SANS,
    fontCode: FONT_MONO,
  });
}

export const lightTheme = build(LIGHT, "light");
export const darkTheme = build(DARK, "dark");
