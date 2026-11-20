import type { UploadItem } from "@mono/hooks/upload";
import { fireEvent, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test-utils/render.js";
import { MultiFileDropzone } from "../multi-file-dropzone.js";
import type { MultiFileDropzoneProps } from "../types.js";

const pdf = (name = "a.pdf", bytes = 3) =>
  new File([new Uint8Array(bytes)], name, { type: "application/pdf", lastModified: 1 });

function Harness(props: Partial<MultiFileDropzoneProps> & { initial?: File[] }) {
  const { initial = [], onChange, ...rest } = props;
  const [files, setFiles] = useState<File[]>(initial);
  return (
    <MultiFileDropzone
      multiple
      testId="dz"
      {...rest}
      value={files}
      onChange={(next) => {
        setFiles(next);
        onChange?.(next);
      }}
    />
  );
}

const pick = (...files: File[]) =>
  fireEvent.change(screen.getByTestId("dz-input"), { target: { files } });
const item = (file: File, patch: Partial<UploadItem>): Record<string, UploadItem> => ({
  [`${file.name}:${file.size}:1`]: {
    key: `${file.name}:${file.size}:1`,
    file,
    status: "idle",
    progress: 0,
    ...patch,
  },
});

describe("MultiFileDropzone", () => {
  it("adds valid files and rejects a wrong extension with the Indonesian message", () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    pick(pdf("a.pdf"), new File(["x"], "virus.exe"));
    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ name: "a.pdf" })]);
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Format file tidak didukung. Harap upload file .pdf, .doc, .docx, .jpg, .jpeg, .png."
      )
    ).toBeInTheDocument();
  });

  it("rejects files over maxSizeMB", () => {
    renderWithProviders(<Harness maxSizeMB={1} />);
    pick(pdf("big.pdf", 2 * 1024 * 1024));
    expect(screen.getByText("Ukuran file melebihi batas maksimal 1 MB.")).toBeInTheDocument();
  });

  it("stops at maxFiles and hides the drop area at the limit", () => {
    renderWithProviders(<Harness maxFiles={2} />);
    pick(pdf("a.pdf"), pdf("b.pdf"), pdf("c.pdf"));
    expect(screen.getByText("Maksimal 2 file.")).toBeInTheDocument();
    expect(screen.queryByTestId("dz-input")).not.toBeInTheDocument();
  });

  it("renames duplicate names so keys stay unique", () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    pick(pdf("laporan.pdf"));
    pick(pdf("laporan.pdf"));
    expect(onChange.mock.lastCall?.[0].map((f: File) => f.name)).toEqual([
      "laporan.pdf",
      "laporan (1).pdf",
    ]);
  });

  it("accepts dropped files", () => {
    renderWithProviders(<Harness />);
    const area = screen
      .getByText(/seret file ke sini/)
      .closest("div[class*='border-dashed']") as HTMLElement;
    fireEvent.dragOver(area);
    fireEvent.drop(area, { dataTransfer: { files: [pdf("drop.pdf")] } });
    expect(screen.getByText("drop.pdf")).toBeInTheDocument();
  });

  it("opens the file picker on click and shows the default helper", () => {
    renderWithProviders(<Harness />);
    const input = screen.getByTestId("dz-input") as HTMLInputElement;
    const click = vi.spyOn(input, "click");
    fireEvent.click(screen.getByText(/seret file ke sini/));
    expect(click).toHaveBeenCalled();
    expect(
      screen.getByText("Bisa beberapa file PDF, DOC, DOCX, JPG, JPEG, PNG – maks. 20 MB & 5 file")
    ).toBeInTheDocument();
  });

  it("ignores a drop or change that carries no files (e.g. dragged text)", () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    const area = screen
      .getByText(/seret file ke sini/)
      .closest("div[class*='border-dashed']") as HTMLElement;
    fireEvent.drop(area, { dataTransfer: {} });
    fireEvent.change(screen.getByTestId("dz-input"), { target: { files: null } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("accepts a file the browser reports without a MIME type", () => {
    renderWithProviders(<Harness accept=".kml" />);
    pick(new File(["<kml/>"], "batas.kml", { type: "" }));
    expect(screen.getByText("batas.kml")).toBeInTheDocument();
  });

  it("removes a file", () => {
    const onChange = vi.fn();
    renderWithProviders(<Harness initial={[pdf("a.pdf")]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Hapus a.pdf" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("readOnly hides the drop area and remove buttons", () => {
    renderWithProviders(<Harness initial={[pdf("a.pdf")]} readOnly />);
    expect(screen.queryByTestId("dz-input")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hapus a.pdf" })).not.toBeInTheDocument();
  });

  it("shows uploading progress and cancels", () => {
    const a = pdf("a.pdf");
    const onCancel = vi.fn();
    renderWithProviders(
      <Harness
        initial={[a]}
        uploads={item(a, { status: "uploading", progress: 0.42 })}
        onCancel={onCancel}
      />
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByText("42%")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Batalkan unggah a.pdf" }));
    expect(onCancel).toHaveBeenCalledWith("a.pdf:3:1");
  });

  it("shows the error and retries", () => {
    const a = pdf("a.pdf");
    const onRetry = vi.fn();
    renderWithProviders(
      <Harness
        initial={[a]}
        uploads={item(a, { status: "error", error: "Kuota habis" })}
        onRetry={onRetry}
      />
    );
    expect(screen.getByText("Kuota habis")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ulangi" }));
    expect(onRetry).toHaveBeenCalledWith("a.pdf:3:1");
  });

  it("shows done", () => {
    const a = pdf("a.pdf");
    renderWithProviders(
      <Harness initial={[a]} uploads={item(a, { status: "done", progress: 1 })} />
    );
    expect(screen.getByLabelText("Terunggah")).toBeInTheDocument();
  });

  it("marks a canceled file so it is never mistaken for an attached one, and offers Ulangi", () => {
    const a = pdf("a.pdf");
    const onRetry = vi.fn();
    renderWithProviders(
      <Harness initial={[a]} uploads={item(a, { status: "canceled" })} onRetry={onRetry} />
    );
    expect(screen.getByText("Unggahan dibatalkan")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ulangi" }));
    expect(onRetry).toHaveBeenCalledWith("a.pdf:3:1");
  });

  it('opens the previewer from "Lihat"', async () => {
    renderWithProviders(<Harness initial={[pdf("a.pdf")]} />);
    fireEvent.click(screen.getByTitle("Lihat preview"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
