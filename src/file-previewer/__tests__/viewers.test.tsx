import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DocxViewer from "../docx-viewer.js";
import PdfViewer from "../pdf-viewer.js";
import { useElementWidth } from "../use-element-width.js";

const renderAsync = vi.hoisted(() => vi.fn());
vi.mock("docx-preview", () => ({ renderAsync }));

const getDocument = vi.hoisted(() => vi.fn());
vi.mock("pdfjs-dist", () => ({ GlobalWorkerOptions: { workerSrc: "" }, getDocument }));

/* ResizeObserver / IntersectionObserver stubs that let a test fire entries. */
type Callback = (entries: unknown[]) => void;
let resizeCallbacks: Callback[] = [];
let intersectionCallbacks: Callback[] = [];
const resizeDisconnect = vi.fn();
const intersectionDisconnect = vi.fn();

class FakeResizeObserver {
  constructor(cb: Callback) {
    resizeCallbacks.push(cb);
  }
  observe() {}
  disconnect() {
    resizeDisconnect();
  }
}
class FakeIntersectionObserver {
  constructor(cb: Callback) {
    intersectionCallbacks.push(cb);
  }
  observe() {}
  disconnect() {
    intersectionDisconnect();
  }
}

function resizeTo(width: number) {
  act(() => {
    for (const cb of resizeCallbacks) cb([{ contentRect: { width } }]);
  });
}

function intersect(isIntersecting: boolean) {
  act(() => {
    for (const cb of intersectionCallbacks) cb([{ isIntersecting }]);
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// jsdom's stubs are non-configurable (vitest.setup.tsx) but writable.
const realResizeObserver = globalThis.ResizeObserver;
const realIntersectionObserver = globalThis.IntersectionObserver;

beforeEach(() => {
  resizeCallbacks = [];
  intersectionCallbacks = [];
  globalThis.ResizeObserver = FakeResizeObserver as unknown as typeof ResizeObserver;
  globalThis.IntersectionObserver =
    FakeIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  globalThis.ResizeObserver = realResizeObserver;
  globalThis.IntersectionObserver = realIntersectionObserver;
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("useElementWidth", () => {
  it("stays 0 without an element", () => {
    const { result } = renderHook(() => useElementWidth({ current: null }));
    expect(result.current).toBe(0);
    expect(resizeCallbacks).toHaveLength(0);
  });

  it("tracks the observed width and disconnects on unmount", () => {
    const ref = { current: document.createElement("div") };
    const { result, unmount } = renderHook(() => useElementWidth(ref));
    resizeTo(320);
    expect(result.current).toBe(320);
    unmount();
    expect(resizeDisconnect).toHaveBeenCalled();
  });
});

describe("DocxViewer", () => {
  it("renders the document, then fits it to the pane", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["docx"]))));
    renderAsync.mockImplementation(async (_blob: Blob, el: HTMLElement) => {
      Object.defineProperty(el, "scrollWidth", { configurable: true, value: 800 });
    });
    const { container, unmount } = render(<DocxViewer url="/a.docx" scale={1} onError={vi.fn()} />);
    const doc = container.querySelector(".w-max") as HTMLElement;
    expect(doc.style.visibility).toBe("hidden");

    await waitFor(() => expect(doc.style.visibility).toBe("visible"));
    expect(renderAsync).toHaveBeenCalledWith(expect.any(Blob), doc, undefined, {
      breakPages: true,
    });
    expect(doc.style.zoom).toBe("1");

    resizeTo(400);
    expect(doc.style.zoom).toBe("0.5");
    unmount();
  });

  it("reports a failed fetch", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    const onError = vi.fn();
    render(<DocxViewer url="/missing.docx" scale={1} onError={onError} />);
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(renderAsync).not.toHaveBeenCalled();
  });

  it("drops the result when unmounted mid-fetch", async () => {
    const fetched = deferred<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => fetched.promise)
    );
    const onError = vi.fn();
    const { unmount } = render(<DocxViewer url="/a.docx" scale={1} onError={onError} />);
    unmount();
    await act(async () => {
      fetched.resolve(new Response(new Blob(["docx"])));
    });
    expect(renderAsync).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("ignores a failure after unmount", async () => {
    const fetched = deferred<Response>();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => fetched.promise)
    );
    const onError = vi.fn();
    const { unmount } = render(<DocxViewer url="/a.docx" scale={1} onError={onError} />);
    unmount();
    await act(async () => {
      fetched.reject(new Error("offline"));
    });
    expect(onError).not.toHaveBeenCalled();
  });
});

function fakePage(width = 100, height = 141) {
  const renderTask = {
    promise: Promise.resolve(),
    cancel: vi.fn(),
  };
  return {
    page: {
      getViewport: vi.fn(({ scale }: { scale: number }) => ({
        width: width * scale,
        height: height * scale,
        scale,
      })),
      render: vi.fn(() => renderTask),
    },
    renderTask,
  };
}

function loadDocument(numPages: number, getPage: (n: number) => Promise<unknown>) {
  const destroy = vi.fn();
  getDocument.mockReturnValue({
    promise: Promise.resolve({ numPages, getPage: vi.fn(getPage) }),
    destroy,
  });
  return destroy;
}

describe("PdfViewer", () => {
  it("lazily renders each visible page within the pane width", async () => {
    const { page } = fakePage();
    const destroy = loadDocument(2, async () => page);
    const { unmount } = render(<PdfViewer url="/a.pdf" scale={1} onError={vi.fn()} />);

    // No width yet: only the placeholder.
    expect(screen.queryByLabelText("Halaman 1")).not.toBeInTheDocument();
    await act(async () => {});
    resizeTo(200);
    expect(screen.getByLabelText("Halaman 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Halaman 2")).toBeInTheDocument();

    intersect(false);
    expect(page.render).not.toHaveBeenCalled();

    intersect(true);
    await waitFor(() => expect(page.render).toHaveBeenCalledTimes(2));
    const canvas = screen.getByLabelText("Halaman 1") as HTMLCanvasElement;
    expect(canvas.style.width).toBe("200px");
    await waitFor(() => expect(canvas.parentElement?.style.minHeight).toBe(""));

    unmount();
    expect(destroy).toHaveBeenCalled();
  });

  it("falls back to an A4 ratio and a device pixel ratio of 1", async () => {
    const dpr = window.devicePixelRatio;
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 0 });
    const { page } = fakePage(100, 0);
    loadDocument(1, async () => page);
    render(<PdfViewer url="/a.pdf" scale={1} onError={vi.fn()} />);
    await act(async () => {});
    resizeTo(100);

    const holder = screen.getByLabelText("Halaman 1").parentElement as HTMLElement;
    expect(holder.style.minHeight).toBe(`${100 * Math.SQRT2}px`);
    intersect(true);
    await waitFor(() => expect(page.render).toHaveBeenCalled());
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: dpr });
  });

  it("cancels a page render on unmount and ignores late results", async () => {
    const first = fakePage();
    const renderDone = deferred<void>();
    first.renderTask.promise = renderDone.promise;
    const pending = deferred<unknown>();
    loadDocument(2, (n) => (n === 1 ? Promise.resolve(first.page) : pending.promise));
    const { unmount } = render(<PdfViewer url="/a.pdf" scale={1} onError={vi.fn()} />);
    await act(async () => {});
    resizeTo(100);
    intersect(true);
    await waitFor(() => expect(first.page.render).toHaveBeenCalledTimes(1));

    unmount();
    expect(first.renderTask.cancel).toHaveBeenCalled();
    await act(async () => {
      renderDone.resolve();
      pending.resolve(first.page);
    });
    // Page 2 resolved after unmount: never rendered.
    expect(first.page.render).toHaveBeenCalledTimes(1);
  });

  it("swallows a rejected page render", async () => {
    const { page } = fakePage();
    // Created on render, so the rejection is handled straight away.
    page.render.mockImplementation(() => ({
      promise: Promise.reject(new Error("cancelled")),
      cancel: vi.fn(),
    }));
    loadDocument(1, async () => page);
    render(<PdfViewer url="/a.pdf" scale={1} onError={vi.fn()} />);
    await act(async () => {});
    resizeTo(100);
    intersect(true);
    await waitFor(() => expect(page.render).toHaveBeenCalled());
    // Still showing the skeleton: the holder keeps its reserved height.
    const holder = screen.getByLabelText("Halaman 1").parentElement as HTMLElement;
    expect(holder.style.minHeight).not.toBe("");
  });

  it.each([
    ["a load error", new Error("bad pdf"), 1],
    ["an empty rejection", undefined, 1],
    ["an abort", Object.assign(new Error("aborted"), { name: "AbortException" }), 0],
  ])("handles %s", async (_label, error, expected) => {
    getDocument.mockReturnValue({ promise: Promise.reject(error), destroy: vi.fn() });
    const onError = vi.fn();
    render(<PdfViewer url="/a.pdf" scale={1} onError={onError} />);
    await act(async () => {});
    expect(onError).toHaveBeenCalledTimes(expected);
  });
});
