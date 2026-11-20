import { beforeEach, describe, expect, it, vi } from "vitest";

const sonner = vi.hoisted(() => {
  const fn = vi.fn() as ReturnType<typeof vi.fn> & Record<string, ReturnType<typeof vi.fn>>;
  for (const key of ["success", "error", "info", "warning", "message", "dismiss"]) {
    fn[key] = vi.fn();
  }
  return fn;
});

vi.mock("sonner", () => ({ toast: sonner }));

import { toast } from "../toast.js";

const okAction = expect.objectContaining({ label: "Ok", onClick: expect.any(Function) });

describe("toast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds an Ok action to the base toast", () => {
    toast("Halo");
    expect(sonner).toHaveBeenCalledWith("Halo", { action: okAction });
    const [, data] = sonner.mock.calls[0];
    expect(data.action.onClick()).toBeUndefined();
  });

  it.each(["success", "error", "info", "warning", "message"] as const)(
    "adds an Ok action to toast.%s",
    (variant) => {
      toast[variant]("Pesan", { description: "detail" });
      expect(sonner[variant]).toHaveBeenCalledWith("Pesan", {
        action: okAction,
        description: "detail",
      });
    }
  );

  it("lets the caller override the action", () => {
    const action = { label: "Undo", onClick: vi.fn() };
    toast.success("Tersimpan", { action });
    expect(sonner.success).toHaveBeenCalledWith("Tersimpan", { action });
  });

  it("passes sonner helpers through", () => {
    toast.dismiss("id-1");
    expect(sonner.dismiss).toHaveBeenCalledWith("id-1");
  });
});
