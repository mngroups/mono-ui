import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StickyFormFooter } from "../../sticky-form-footer/sticky-form-footer.js";
import { UiConfigProvider, useUiConfig } from "../ui-config.js";

function Probe() {
  return <span>{String(useUiConfig().mobileNavV2)}</span>;
}

describe("UiConfigProvider", () => {
  it("defaults mobileNavV2 to false without a provider", () => {
    render(<Probe />);
    expect(screen.getByText("false")).toBeInTheDocument();
  });

  it("provides mobileNavV2 to components", () => {
    render(
      <UiConfigProvider mobileNavV2>
        <Probe />
      </UiConfigProvider>
    );
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("lets a component prop override the provider", () => {
    const { container } = render(
      <UiConfigProvider mobileNavV2>
        <StickyFormFooter className="row" mobileNavV2={false}>
          <span>Simpan</span>
        </StickyFormFooter>
      </UiConfigProvider>
    );
    expect(container.firstElementChild).toHaveClass("row");
    expect(container.querySelectorAll("div")).toHaveLength(1);
  });
});
