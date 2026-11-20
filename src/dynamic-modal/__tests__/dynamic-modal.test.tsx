import { fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const flag = vi.hoisted(() => ({ enabled: false }));

vi.mock("../../config/ui-config.js", () => ({
  useUiConfig: () => ({ mobileNavV2: flag.enabled }),
}));

import { DynamicModal } from "../dynamic-modal.js";
import { useModalLayer } from "../use-modal-layer.js";

afterEach(() => {
  flag.enabled = false;
});

describe("DynamicModal", () => {
  it("renders header, body and default footer; cancel and close both close", () => {
    const onOpenChange = vi.fn();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DynamicModal
        open
        onOpenChange={onOpenChange}
        title="Hapus data"
        description="Yakin?"
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        modalWidth={480}
        testId="modal"
        closeTestId="close"
      >
        <p>Isi</p>
      </DynamicModal>
    );

    expect(screen.getByText("Hapus data")).toBeInTheDocument();
    expect(screen.getByText("Yakin?")).toBeInTheDocument();
    expect(screen.getByText("Isi")).toBeInTheDocument();
    expect(screen.getByTestId("modal")).toHaveStyle({ maxWidth: "480px" });

    fireEvent.click(screen.getByRole("button", { name: "Hapus" }));
    expect(onConfirm).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    const close = screen.getByTestId("close");
    fireEvent.pointerDown(close);
    fireEvent.click(close);
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it("shows a loading confirm and a stacked footer without a header", () => {
    render(
      <DynamicModal
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        loading
        footerLayout="stack"
        footerAlign="center"
        testId="modal"
      >
        <p>Isi</p>
      </DynamicModal>
    );

    // Spinner only, no "Loading..." text; the label stays the accessible name.
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: "Konfirmasi" });
    expect(confirm).toBeDisabled();
    expect(confirm.querySelector(".animate-spin")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Batal" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Tutup" })).not.toBeInTheDocument();
  });

  it("renders a cancel-only footer, and a title without description", () => {
    const onOpenChange = vi.fn();
    render(
      <DynamicModal open onOpenChange={onOpenChange} title="Info" onCancel={vi.fn()}>
        <p>Isi</p>
      </DynamicModal>
    );

    expect(screen.queryByRole("button", { name: "Konfirmasi" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes without onCancel from the header button", () => {
    const onOpenChange = vi.fn();
    render(<DynamicModal open onOpenChange={onOpenChange} description="Hanya deskripsi" />);
    fireEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("uses a custom footer and the pinned mobile layout", () => {
    flag.enabled = true;
    render(
      <DynamicModal
        open
        onOpenChange={vi.fn()}
        title="Form"
        footer={<span>Custom footer</span>}
        mobileFullHeight
        testId="modal"
      >
        <p>Isi</p>
      </DynamicModal>
    );

    expect(screen.getByText("Custom footer")).toBeInTheDocument();
    expect(screen.getByTestId("modal")).toHaveClass("md:flex", "max-md:flex-1");
    expect(screen.queryByRole("button", { name: "Batal" })).not.toBeInTheDocument();
  });

  it("renders the full-height layout without the flag", () => {
    render(
      <DynamicModal open onOpenChange={vi.fn()} title="Form" mobileFullHeight testId="modal" />
    );
    expect(screen.getByTestId("modal")).toHaveClass("max-md:flex-1");
  });
});

describe("useModalLayer", () => {
  it("stays at depth 0 while closed and stacks open modals", () => {
    const closed = renderHook(() => useModalLayer(false));
    expect(closed.result.current).toEqual({ depth: 0, overlayZ: 9998, contentZ: 9999 });

    const first = renderHook(({ open }) => useModalLayer(open), { initialProps: { open: true } });
    const second = renderHook(() => useModalLayer(true));
    expect(first.result.current.depth).toBe(0);
    expect(second.result.current).toEqual({ depth: 1, overlayZ: 10008, contentZ: 10009 });

    first.rerender({ open: false });
    expect(second.result.current.depth).toBe(0);
    second.unmount();
    first.unmount();
    closed.unmount();
  });
});
