"use client";

import { createContext, type ReactNode, useContext } from "react";

export type UiConfig = {
  /**
   * Modern mobile chrome: DynamicModal pins its header/footer on phones and
   * StickyFormFooter pins form actions above the bottom navigation.
   */
  mobileNavV2: boolean;
};

const DEFAULT_UI_CONFIG: UiConfig = { mobileNavV2: false };

const UiConfigContext = createContext<UiConfig>(DEFAULT_UI_CONFIG);

/** App-wide switches for @mono/ui components (e.g. wire `mobileNavV2` to a feature flag). */
export function UiConfigProvider({
  children,
  ...config
}: Partial<UiConfig> & { children: ReactNode }) {
  return (
    <UiConfigContext.Provider value={{ ...DEFAULT_UI_CONFIG, ...config }}>
      {children}
    </UiConfigContext.Provider>
  );
}

export function useUiConfig(): UiConfig {
  return useContext(UiConfigContext);
}
