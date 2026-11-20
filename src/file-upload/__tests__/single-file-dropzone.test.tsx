import type { UploadItem } from "@mono/hooks/upload";
import { act, fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test-utils/render.js";
import { FileUploadDropzone } from "../file-upload-dropzone.js";
import { SingleFileDropzone } from "../single-file-dropzone.js";
import type { SingleFileDropzoneProps, SinglePreviewState, TransformResult } from "../types.js";

const pdf = (name = "a.pdf") =>
  new File(["abc"], name, { type: "application/pdf", lastModified: 1 });

function Harness(props: Partial<SingleFileDropzoneProps> & { initial?: File | null }) {
  const { initial = null, onChange, ...rest } = props;
  const [file, setFile] = useState<File | null>(initial);
  return (
    <SingleFileDropzone
      testId="dz"
      {...rest}
      value={file}
      onChange={(next) => {
        setFile(next);
        onChange?.(next);
      }}
    />
  );
}

const pick = (file: File) =>
  fireEvent.change(screen.getByTestId("dz-input"), { target: { files: [file] } });

function deferred() {
  let resolve!: (r: TransformResult) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<TransformResult>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const states = (preview: ReturnType<typeof vi.fn>) =>
  preview.mock.calls.map(([s]) => (s as SinglePreviewState).status);

describe("SingleFileDropzone", () => {
  it("validates like the multiple one and calls onChange(file)", () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} maxSizeMB={1} />);
    pick(new File(["x"], "a.exe"));
    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByText(/Format file tidak didukung/)).toBeInTheDocument();
    pick(pdf());
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: "a.pdf" }));
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(screen.getByText("Ganti file")).toBeInTheDocument();
    expect(screen.queryByText(/Format file tidak didukung/)).not.toBeInTheDocument();
  });

  it("shows the empty state with a computed helper, and opens the picker on click", () => {
    renderWithProviders(<Harness accept=".pdf,.zip" />);
    expect(
      screen.getByText("Klik untuk unggah dan pilih dokumen atau seret file ke sini")
    ).toBeInTheDocument();
    expect(screen.getByText("PDF, ZIP – maks. 20 MB")).toBeInTheDocument();
    const click = vi.spyOn(screen.getByTestId("dz-input") as HTMLInputElement, "click");
    fireEvent.click(screen.getByText(/seret file ke sini/));
    expect(click).toHaveBeenCalled();
  });

  it("accepts a dropped file and ignores an empty drop", () => {
    renderWithProviders(<Harness helperText="Bantuan" />);
    const zone = screen.getByText("Bantuan").closest("[data-dropzone]") as HTMLElement;
    fireEvent.dragOver(zone);
    fireEvent.drop(zone, { dataTransfer: { files: [] } });
    fireEvent.drop(zone, { dataTransfer: { files: [pdf("drop.pdf")] } });
    expect(screen.getByText("drop.pdf")).toBeInTheDocument();
  });

  it("transformFile pending shows a skeleton overlay, then onChange(result.file)", async () => {
    const d = deferred();
    const parsed = pdf("parsed.pdf");
    const onChange = vi.fn();
    const preview = vi.fn((_state: SinglePreviewState) => <p>peta</p>);
    renderWithProviders(
      <Harness onChange={onChange} transformFile={() => d.promise} preview={preview} />
    );
    pick(pdf());
    expect(screen.getByText("Memproses file…")).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    await act(async () => d.resolve({ file: parsed }));
    expect(onChange).toHaveBeenCalledWith(parsed);
    expect(states(preview)).toContain("transforming");
    expect(states(preview).at(-1)).toBe("ok");
    expect(screen.getByText("peta")).toBeInTheDocument();
  });

  it("transformFile warning keeps the file and shows the warning", async () => {
    const f = pdf();
    const onChange = vi.fn();
    const preview = vi.fn((_state: SinglePreviewState) => null);
    renderWithProviders(
      <Harness
        onChange={onChange}
        preview={preview}
        transformFile={async (file) => ({ file, warning: "Sebagian fitur dilewati" })}
      />
    );
    await act(async () => pick(f));
    expect(onChange).toHaveBeenCalledWith(f);
    expect(screen.getByText("Sebagian fitur dilewati")).toHaveClass("text-amber-600");
    expect(states(preview).at(-1)).toBe("warning");
  });

  it("transformFile error keeps the picked name, shows the error with Ganti, calls onChange(null)", async () => {
    const onChange = vi.fn();
    const preview = vi.fn((_state: SinglePreviewState) => null);
    renderWithProviders(
      <Harness
        onChange={onChange}
        preview={preview}
        transformFile={async () => ({ error: "Shapefile rusak" })}
      />
    );
    await act(async () => pick(pdf("peta.zip.pdf")));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByText("Shapefile rusak")).toBeInTheDocument();
    expect(screen.getByText("peta.zip.pdf")).toBeInTheDocument();
    const click = vi.spyOn(screen.getByTestId("dz-input") as HTMLInputElement, "click");
    fireEvent.click(screen.getByRole("button", { name: "Ganti" }));
    expect(click).toHaveBeenCalled();
    expect(preview.mock.lastCall?.[0]).toMatchObject({ status: "error", file: expect.any(File) });
  });

  it("a thrown transformFile becomes an error state", async () => {
    renderWithProviders(
      <Harness transformFile={() => Promise.reject(new Error("Zip tidak valid"))} />
    );
    await act(async () => pick(pdf()));
    expect(screen.getByText("Zip tidak valid")).toBeInTheDocument();
  });

  it("ignores a transform that finishes after a newer pick", async () => {
    const first = deferred();
    const second = deferred();
    const queue = [first, second];
    const onChange = vi.fn();
    renderWithProviders(
      <Harness onChange={onChange} transformFile={() => (queue.shift() as typeof first).promise} />
    );
    pick(pdf("lama.pdf"));
    pick(pdf("baru.pdf"));
    const fresh = pdf("baru.pdf");
    await act(async () => second.resolve({ file: fresh }));
    await act(async () => first.resolve({ file: pdf("lama.pdf") }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(fresh);
  });

  it("lets a non-null preview replace the default body, with openPicker for its own Ganti", () => {
    renderWithProviders(
      <Harness
        initial={pdf("peta.zip")}
        accept=".zip"
        preview={(state) =>
          state.file ? (
            <div>
              <span>Peta {state.file.name}</span>
              <button type="button" onClick={state.openPicker}>
                Ganti peta
              </button>
            </div>
          ) : null
        }
      />
    );
    expect(screen.getByText("Peta peta.zip")).toBeInTheDocument();
    expect(screen.queryByText("Ganti file")).not.toBeInTheDocument();
    const click = vi.spyOn(screen.getByTestId("dz-input") as HTMLInputElement, "click");
    fireEvent.click(screen.getByRole("button", { name: "Ganti peta" }));
    expect(click).toHaveBeenCalledTimes(1);
    fireEvent.drop(screen.getByText("Peta peta.zip").closest("[data-dropzone]") as HTMLElement, {
      dataTransfer: { files: [pdf("baru.zip")] },
    });
    expect(screen.getByText("Peta baru.zip")).toBeInTheDocument();
  });

  it("passes transformFile data and messages to the preview, and keeps the error screen to the slot", async () => {
    const preview = vi.fn((state: SinglePreviewState) =>
      state.status === "transforming" ? null : (
        <p>{`${state.status}:${String(state.data ?? state.message)}`}</p>
      )
    );
    const results: TransformResult[] = [
      { file: pdf("a.zip"), data: "fc-1" },
      { file: pdf("b.zip"), warning: "Sebagian dilewati", data: "fc-2" },
      { error: "Zip rusak" },
    ];
    renderWithProviders(
      <Harness
        accept=".zip"
        preview={preview}
        transformFile={async () => results.shift() as TransformResult}
      />
    );
    await act(async () => pick(pdf("a.zip")));
    expect(screen.getByText("ok:fc-1")).toBeInTheDocument();
    await act(async () => pick(pdf("b.zip")));
    expect(screen.getByText("warning:fc-2")).toBeInTheDocument();
    expect(preview.mock.lastCall?.[0]).toMatchObject({ message: "Sebagian dilewati" });
    await act(async () => pick(pdf("c.zip")));
    expect(screen.getByText("error:Zip rusak")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ganti" })).not.toBeInTheDocument();
  });

  it("keeps showing upload progress under a slot that replaced the body", () => {
    const f = pdf("peta.zip");
    const uploads: Record<string, UploadItem> = {
      "peta.zip:3:1": { key: "peta.zip:3:1", file: f, status: "uploading", progress: 0.6 },
    };
    renderWithProviders(
      <Harness initial={f} accept=".zip" uploads={uploads} preview={() => <p>peta</p>} />
    );
    expect(screen.getByText("peta")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "60");
  });

  it("takes a custom transforming label", () => {
    renderWithProviders(
      <Harness
        transformingLabel="Memproses shapefile…"
        transformFile={() => new Promise(() => {})}
      />
    );
    pick(pdf());
    expect(screen.getByText("Memproses shapefile…")).toBeInTheDocument();
  });

  it("renders existingFileName when there is no value", () => {
    const preview = vi.fn((_state: SinglePreviewState) => null);
    renderWithProviders(
      <Harness existingFileName="lama.pdf" existingFileUrl="https://x/lama.pdf" preview={preview} />
    );
    expect(screen.getByText("lama.pdf")).toBeInTheDocument();
    expect(preview.mock.lastCall?.[0]).toMatchObject({
      file: null,
      existingFileName: "lama.pdf",
      existingFileUrl: "https://x/lama.pdf",
      status: "idle",
    });
  });

  it("upload uploading blocks replacing until canceled", () => {
    const f = pdf();
    const onCancel = vi.fn();
    const uploads: Record<string, UploadItem> = {
      "a.pdf:3:1": { key: "a.pdf:3:1", file: f, status: "uploading", progress: 0.3 },
    };
    renderWithProviders(<Harness initial={f} uploads={uploads} onCancel={onCancel} />);
    const click = vi.spyOn(screen.getByTestId("dz-input") as HTMLInputElement, "click");
    fireEvent.click(screen.getByText("a.pdf"));
    fireEvent.drop(screen.getByText("a.pdf").closest("[data-dropzone]") as HTMLElement, {
      dataTransfer: { files: [pdf("lain.pdf")] },
    });
    expect(click).not.toHaveBeenCalled();
    expect(screen.queryByText("lain.pdf")).not.toBeInTheDocument();
    expect(screen.queryByText("Ganti file")).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "30");
    fireEvent.click(screen.getByRole("button", { name: "Batalkan unggah a.pdf" }));
    expect(onCancel).toHaveBeenCalledWith("a.pdf:3:1");
  });

  it("a canceled upload says so instead of looking attached", () => {
    const f = pdf();
    const onRetry = vi.fn();
    const uploads: Record<string, UploadItem> = {
      "a.pdf:3:1": { key: "a.pdf:3:1", file: f, status: "canceled", progress: 0 },
    };
    renderWithProviders(<Harness initial={f} uploads={uploads} onRetry={onRetry} />);
    expect(screen.getByText("Unggahan dibatalkan")).toBeInTheDocument();
    expect(screen.queryByText("Ganti file")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ulangi" }));
    expect(onRetry).toHaveBeenCalledWith("a.pdf:3:1");
  });

  it("upload error shows Ulangi", () => {
    const f = pdf();
    const onRetry = vi.fn();
    const uploads: Record<string, UploadItem> = {
      "a.pdf:3:1": { key: "a.pdf:3:1", file: f, status: "error", progress: 0, error: "Gagal" },
    };
    renderWithProviders(<Harness initial={f} uploads={uploads} onRetry={onRetry} />);
    fireEvent.click(screen.getByRole("button", { name: "Ulangi" }));
    expect(onRetry).toHaveBeenCalledWith("a.pdf:3:1");
  });

  it("readOnly ignores clicks and drops", () => {
    renderWithProviders(<Harness readOnly existingFileName="lama.pdf" />);
    const click = vi.spyOn(screen.getByTestId("dz-input") as HTMLInputElement, "click");
    fireEvent.click(screen.getByText("lama.pdf"));
    fireEvent.drop(screen.getByText("lama.pdf").closest("[data-dropzone]") as HTMLElement, {
      dataTransfer: { files: [pdf("baru.pdf")] },
    });
    expect(click).not.toHaveBeenCalled();
    expect(screen.queryByText("baru.pdf")).not.toBeInTheDocument();
    expect(screen.queryByText("Ganti file")).not.toBeInTheDocument();
  });

  it("ignores an input change with no file", () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    fireEvent.change(screen.getByTestId("dz-input"), { target: { files: [] } });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("FileUploadDropzone", () => {
  it("switches on multiple", () => {
    const { rerender } = renderWithProviders(
      <FileUploadDropzone multiple value={[]} onChange={() => {}} testId="m" />
    );
    expect(screen.getByTestId("m-input")).toHaveAttribute("multiple");
    rerender(<FileUploadDropzone value={null} onChange={() => {}} testId="s" />);
    expect(screen.getByTestId("s-input")).not.toHaveAttribute("multiple");
  });
});
