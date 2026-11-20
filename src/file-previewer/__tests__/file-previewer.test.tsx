import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test-utils/render.js";

import {
  downloadFile,
  formatFileSize,
  getFileKind,
  isHeicFile,
  type PreviewFileGroup,
} from "../file-kind.js";
import { FilePreviewer } from "../file-previewer.js";
import { FileTypeIcon } from "../file-type-icon.js";

vi.mock("../pdf-viewer.js", () => ({ default: () => <div data-testid="pdf-viewer" /> }));
vi.mock("../docx-viewer.js", () => ({ default: () => <div data-testid="docx-viewer" /> }));

const heicTo = vi.hoisted(() => vi.fn());
vi.mock("heic-to", () => ({ heicTo }));

const toastError = vi.hoisted(() => vi.fn());
vi.mock("../../ui/toast.js", () => ({ toast: { error: toastError } }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const IMAGE = {
  id: "img",
  name: "foto-lokasi.jpg",
  url: "https://s3.example/foto.jpg",
  size: 2_516_582,
};
const HEIC = { id: "heic", name: "foto-lapangan.HEIC", url: "https://s3.example/foto.heic" };
const ZIP = { id: "zip", name: "data-patok.zip", url: "https://s3.example/patok.zip" };
const PDF = { id: "pdf", name: "surat-kuasa.pdf", url: "https://s3.example/surat.pdf" };

const GROUPS: PreviewFileGroup[] = [
  {
    id: "g1",
    label: "Diperbaharui",
    tone: "warning",
    timestamp: "22-06-2022, 01:14:10",
    note: "Perubahan: Status Bebas",
    files: [IMAGE, PDF],
  },
  { id: "g2", label: "Ditambahkan", files: [ZIP] },
];

describe("getFileKind", () => {
  it.each([
    [{ name: "a.JPG", url: "" }, "image"],
    [{ name: "a.pdf", url: "" }, "pdf"],
    [{ name: "a.docx", url: "" }, "docx"],
    [{ name: "a.zip", url: "" }, "other"],
    [{ name: "lampiran", url: "https://s3.example/x.pdf?X-Amz-Signature=abc" }, "pdf"],
    [{ name: "lampiran", url: "", mimeType: "image/png" }, "image"],
    [{ name: "a.heic", url: "" }, "image"],
    [{ name: "lampiran", url: "", mimeType: "application/pdf" }, "pdf"],
    [
      {
        name: "lampiran",
        url: "",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      "docx",
    ],
  ] as const)("%o → %s", (file, kind) => {
    expect(getFileKind(file)).toBe(kind);
  });
});

describe("isHeicFile", () => {
  it.each([
    [{ name: "a.HEIC", url: "" }, true],
    [{ name: "lampiran", url: "https://s3.example/x.heic?X-Amz-Signature=abc" }, true],
    [{ name: "lampiran", url: "", mimeType: "image/heic" }, true],
    [{ name: "a.jpg", url: "", mimeType: "image/jpeg" }, false],
  ] as const)("%o → %s", (file, expected) => {
    expect(isHeicFile(file)).toBe(expected);
  });
});

describe("formatFileSize", () => {
  it.each([
    [512, "512 B"],
    [2048, "2.0 KB"],
    [3 * 1024 * 1024, "3.0 MB"],
  ])("%d → %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe("downloadFile", () => {
  it("downloads a blob: URL as-is", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    await downloadFile({ name: "a.pdf", url: "blob:local" });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("fetches a remote file and revokes its object URL afterwards", async () => {
    vi.useFakeTimers();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["x"]))));
    URL.createObjectURL = vi.fn(() => "blob:fetched");
    URL.revokeObjectURL = vi.fn();
    await downloadFile({ name: "a.pdf", url: "https://s3.example/a.pdf" });
    expect(click).toHaveBeenCalledTimes(1);
    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fetched");
    vi.useRealTimers();
  });

  it("opens the link when the fetch is not ok", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
    await downloadFile({ name: "a.pdf", url: "https://s3.example/a.pdf" });
    expect(open).toHaveBeenCalledWith("https://s3.example/a.pdf", "_blank", "noopener,noreferrer");
  });
});

describe("FileTypeIcon", () => {
  it.each([
    ["laporan.docx", "text-blue-600"],
    ["rekap.xlsx", "text-green-700"],
    ["arsip.7z", "text-amber-700"],
    ["catatan", "text-foreground/60"],
  ])("%s → %s", (name, tone) => {
    const { container } = renderWithProviders(
      <FileTypeIcon file={{ name, url: "" }} size="md" className="extra" />
    );
    expect(container.firstChild).toHaveClass(tone, "h-9", "extra");
  });

  it("falls back to the image icon when the thumbnail fails", () => {
    const { container } = renderWithProviders(
      <FileTypeIcon file={{ name: "foto.jpg", url: "https://s3.example/foto.jpg" }} />
    );
    const img = container.querySelector("img") as HTMLImageElement;
    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
    expect(container.firstChild).toHaveClass("text-emerald-700");
  });
});

describe("FilePreviewer", () => {
  it("renders an empty previewer without files or groups", () => {
    renderWithProviders(<FilePreviewer open onOpenChange={vi.fn()} />);
    expect(screen.getByText("Attachment (0)")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unduh" })).not.toBeInTheDocument();
  });

  it("resets the selection when closed", () => {
    const { rerender } = renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} groups={GROUPS} />
    );
    fireEvent.click(
      within(screen.getByLabelText("Daftar file")).getByRole("button", { name: /^data-patok/ })
    );
    rerender(<FilePreviewer open={false} onOpenChange={vi.fn()} groups={GROUPS} />);
    rerender(<FilePreviewer open onOpenChange={vi.fn()} groups={GROUPS} />);
    expect(
      within(screen.getByLabelText("Daftar file")).getByRole("button", { name: /^foto-lokasi/ })
    ).toHaveAttribute("aria-current", "true");
  });

  it("goes back to the list from the preview", async () => {
    const { unmount } = renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} groups={GROUPS} initialFileId="img" />
    );
    const preview = () => screen.getByAltText("foto-lokasi.jpg").closest(".flex-1.rounded-xl");
    expect(preview()).not.toHaveClass("max-md:hidden");
    fireEvent.click(screen.getByRole("button", { name: "Kembali ke daftar file" }));
    expect(preview()).toHaveClass("max-md:hidden");
    unmount();

    renderWithProviders(
      <FilePreviewer
        open
        onOpenChange={vi.fn()}
        groups={GROUPS}
        initialFileId="img"
        resolveUrl={async (f) => `https://s3.example/signed/${f.id}`}
      />
    );
    await screen.findByAltText("foto-lokasi.jpg");
    fireEvent.click(screen.getByRole("button", { name: "Kembali ke daftar file" }));
    expect(screen.getByAltText("foto-lokasi.jpg").closest(".flex-1.rounded-xl")).toHaveClass(
      "max-md:hidden"
    );
  });

  it("downloads every file one by one without onDownloadAll", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const blobFiles = GROUPS.map((g) => ({
      ...g,
      files: g.files.map((f) => ({ ...f, url: `blob:${f.id}` })),
    }));
    renderWithProviders(<FilePreviewer open onOpenChange={vi.fn()} groups={blobFiles} />);
    fireEvent.click(screen.getByRole("button", { name: "Unduh Semua" }));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(3));
  });

  it("toasts when a file's URL can't be resolved for download", async () => {
    const resolveUrl = vi.fn().mockRejectedValue(new Error("expired"));
    renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} groups={GROUPS} resolveUrl={resolveUrl} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Unduh data-patok.zip" }));
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Gagal mengunduh data-patok.zip"));
  });

  it("hands download failures to onDownloadError instead of toasting", async () => {
    toastError.mockClear();
    const resolveUrl = vi.fn().mockRejectedValue(new Error("expired"));
    const onDownloadError = vi.fn();
    renderWithProviders(
      <FilePreviewer
        open
        onOpenChange={vi.fn()}
        groups={GROUPS}
        resolveUrl={resolveUrl}
        onDownloadError={onDownloadError}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Unduh data-patok.zip" }));
    await waitFor(() => expect(onDownloadError).toHaveBeenCalled());
    expect(onDownloadError.mock.calls[0][0]).toMatchObject({ name: "data-patok.zip" });
    expect(toastError).not.toHaveBeenCalled();
  });

  it("zooms out and downloads from the preview toolbar", async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} files={[{ ...IMAGE, url: "blob:img" }]} />
    );
    fireEvent.click(screen.getByRole("button", { name: "Perkecil" }));
    expect(screen.getByText("75%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Unduh" }));
    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
  });

  it("lazy-loads the docx viewer", async () => {
    renderWithProviders(
      <FilePreviewer
        open
        onOpenChange={vi.fn()}
        files={[{ id: "doc", name: "surat.docx", url: "https://s3.example/surat.docx" }]}
      />
    );
    expect(await screen.findByTestId("docx-viewer")).toBeInTheDocument();
  });

  it("gives up when a converted HEIC still fails to load", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["heic"]))));
    URL.createObjectURL = vi.fn(() => "blob:converted");
    URL.revokeObjectURL = vi.fn();
    heicTo.mockResolvedValue(new Blob(["jpeg"], { type: "image/jpeg" }));
    renderWithProviders(<FilePreviewer open onOpenChange={vi.fn()} files={[HEIC]} />);

    fireEvent.error(screen.getByAltText("foto-lapangan.HEIC"));
    await waitFor(() =>
      expect(screen.getByAltText("foto-lapangan.HEIC")).toHaveAttribute("src", "blob:converted")
    );
    fireEvent.error(screen.getByAltText("foto-lapangan.HEIC"));
    expect(await screen.findByText("File Gagal Dimuat")).toBeInTheDocument();
  });

  it("revokes a HEIC conversion that finishes after unmount", async () => {
    let finish!: (blob: Blob) => void;
    heicTo.mockImplementation(() => new Promise<Blob>((res) => (finish = res)));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["heic"]))));
    URL.createObjectURL = vi.fn(() => "blob:late");
    URL.revokeObjectURL = vi.fn();
    const { unmount } = renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} files={[HEIC]} />
    );
    fireEvent.error(screen.getByAltText("foto-lapangan.HEIC"));
    await waitFor(() => expect(heicTo).toHaveBeenCalled());
    unmount();
    finish(new Blob(["jpeg"]));
    await waitFor(() => expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:late"));
  });

  it("ignores a HEIC conversion failure after unmount", async () => {
    let fail!: (err: Error) => void;
    heicTo.mockImplementation(() => new Promise<Blob>((_res, rej) => (fail = rej)));
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["heic"]))));
    const { unmount } = renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} files={[HEIC]} />
    );
    fireEvent.error(screen.getByAltText("foto-lapangan.HEIC"));
    await waitFor(() => expect(heicTo).toHaveBeenCalled());
    unmount();
    fail(new Error("decode"));
    await Promise.resolve();
    expect(screen.queryByText("File Gagal Dimuat")).not.toBeInTheDocument();
  });

  it("previews a single file without a sidebar", () => {
    renderWithProviders(<FilePreviewer open onOpenChange={vi.fn()} files={[IMAGE]} />);

    expect(screen.getByText("Attachment (1)")).toBeInTheDocument();
    expect(screen.queryByLabelText("Daftar file")).not.toBeInTheDocument();
    expect(screen.getByAltText("foto-lokasi.jpg")).toHaveAttribute("src", IMAGE.url);
    expect(screen.queryByRole("button", { name: "Unduh Semua" })).not.toBeInTheDocument();
  });

  it("groups files and switches the preview on selection", () => {
    renderWithProviders(<FilePreviewer open onOpenChange={vi.fn()} groups={GROUPS} />);

    const list = screen.getByLabelText("Daftar file");
    expect(within(list).getByText("Diperbaharui")).toBeInTheDocument();
    expect(within(list).getByText("22-06-2022, 01:14:10")).toBeInTheDocument();
    expect(within(list).getByText("Perubahan: Status Bebas")).toBeInTheDocument();
    expect(within(list).getByText("2.4 MB")).toBeInTheDocument();
    expect(within(list).getByRole("button", { name: /^foto-lokasi\.jpg/ })).toHaveAttribute(
      "aria-current",
      "true"
    );

    fireEvent.click(within(list).getByRole("button", { name: /^data-patok\.zip/ }));
    expect(screen.getByText("File Tidak Bisa Dibuka di Sini")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Perbesar" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unduh Semua" })).toBeInTheDocument();
  });

  it("renders a group label with the feature's own badge classes", () => {
    renderWithProviders(
      <FilePreviewer
        open
        onOpenChange={vi.fn()}
        groups={[
          { id: "g", label: "Dokumen Bebas", labelClassName: "badge-bebas", files: [ZIP, PDF] },
        ]}
      />
    );
    expect(within(screen.getByLabelText("Daftar file")).getByText("Dokumen Bebas")).toHaveClass(
      "badge-bebas"
    );
  });

  it("opens on initialFileId and lazy-loads the pdf viewer", async () => {
    renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} groups={GROUPS} initialFileId="pdf" />
    );

    expect(await screen.findByTestId("pdf-viewer")).toBeInTheDocument();
  });

  it("bounds zoom and opens the file in a new tab", () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    renderWithProviders(<FilePreviewer open onOpenChange={vi.fn()} files={[IMAGE]} />);

    const zoomIn = screen.getByRole("button", { name: "Perbesar" });
    for (let i = 0; i < 12; i++) fireEvent.click(zoomIn);
    expect(zoomIn).toBeDisabled();
    expect(screen.getByText("400%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Buka di tab baru" }));
    expect(open).toHaveBeenCalledWith(IMAGE.url, "_blank", "noopener,noreferrer");
    open.mockRestore();
  });

  it("fetches the URL of the opened file when resolveUrl is given", async () => {
    const resolveUrl = vi.fn(
      async (file: { id: string }) => `https://s3.example/signed/${file.id}`
    );
    renderWithProviders(
      <FilePreviewer
        open
        onOpenChange={vi.fn()}
        files={[
          { ...IMAGE, url: "" },
          { ...ZIP, url: "" },
        ]}
        resolveUrl={resolveUrl}
      />
    );

    expect(await screen.findByAltText("foto-lokasi.jpg")).toHaveAttribute(
      "src",
      "https://s3.example/signed/img"
    );
    // Only the file on screen is resolved.
    expect(resolveUrl).toHaveBeenCalledTimes(1);
  });

  it("offers a retry when the URL can't be fetched", async () => {
    const resolveUrl = vi
      .fn()
      .mockRejectedValueOnce(new Error("expired"))
      .mockResolvedValue("https://s3.example/signed/img");
    renderWithProviders(
      <FilePreviewer
        open
        onOpenChange={vi.fn()}
        files={[{ ...IMAGE, url: "" }]}
        resolveUrl={resolveUrl}
      />
    );

    fireEvent.click(await screen.findByRole("button", { name: "Coba lagi" }));
    expect(await screen.findByAltText("foto-lokasi.jpg")).toBeInTheDocument();
  });

  it("downloads a listed file through resolveUrl", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("cors")));
    const resolveUrl = vi.fn(
      async (file: { id: string }) => `https://s3.example/signed/${file.id}`
    );
    const lazy = GROUPS.map((g) => ({ ...g, files: g.files.map((f) => ({ ...f, url: "" })) }));
    renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} groups={lazy} resolveUrl={resolveUrl} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Unduh data-patok.zip" }));
    // A blocked fetch falls back to opening the signed link.
    await waitFor(() =>
      expect(open).toHaveBeenCalledWith(
        "https://s3.example/signed/zip",
        "_blank",
        "noopener,noreferrer"
      )
    );
    vi.unstubAllGlobals();
    open.mockRestore();
  });

  it("converts a HEIC the browser can't decode to JPEG", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["heic"]))));
    // jsdom has no object URLs.
    URL.createObjectURL = vi.fn(() => "blob:converted");
    URL.revokeObjectURL = vi.fn();
    heicTo.mockResolvedValue(new Blob(["jpeg"], { type: "image/jpeg" }));
    renderWithProviders(<FilePreviewer open onOpenChange={vi.fn()} files={[HEIC]} />);

    fireEvent.error(screen.getByAltText("foto-lapangan.HEIC"));
    await waitFor(() =>
      expect(screen.getByAltText("foto-lapangan.HEIC")).toHaveAttribute("src", "blob:converted")
    );
    expect(heicTo).toHaveBeenCalledWith(expect.objectContaining({ type: "image/jpeg" }));
    vi.unstubAllGlobals();
  });

  it("falls back to download when the HEIC conversion fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new Blob(["heic"]))));
    heicTo.mockRejectedValue(new Error("decode"));
    renderWithProviders(<FilePreviewer open onOpenChange={vi.fn()} files={[HEIC]} />);

    fireEvent.error(screen.getByAltText("foto-lapangan.HEIC"));
    expect(await screen.findByText("File Gagal Dimuat")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("hands Unduh Semua to onDownloadAll when given", async () => {
    const onDownloadAll = vi.fn(async () => {});
    renderWithProviders(
      <FilePreviewer open onOpenChange={vi.fn()} groups={GROUPS} onDownloadAll={onDownloadAll} />
    );

    fireEvent.click(screen.getByRole("button", { name: "Unduh Semua" }));
    await waitFor(() => expect(onDownloadAll).toHaveBeenCalledTimes(1));
  });

  it("closes from the footer", () => {
    const onOpenChange = vi.fn();
    renderWithProviders(<FilePreviewer open onOpenChange={onOpenChange} files={[IMAGE]} />);

    fireEvent.click(screen.getByText("Tutup"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
