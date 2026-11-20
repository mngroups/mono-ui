import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../../test-utils/render.js";
import { FileRowButton, PreviewFileList } from "../preview-file-list.js";
import { UploadState } from "../upload-state.js";

describe("PreviewFileList", () => {
  it("lists server files without local sources and resolves their URL when opened", async () => {
    const resolveUrl = vi.fn(async () => "data:application/pdf;base64,AA==");
    renderWithProviders(
      <PreviewFileList files={[{ id: "s1", name: "arsip.pdf", url: "" }]} resolveUrl={resolveUrl} />
    );
    expect(screen.getByText("arsip.pdf")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hapus arsip.pdf" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Lihat preview"));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await waitFor(() => expect(resolveUrl).toHaveBeenCalled());
  });

  it("closes the previewer", async () => {
    renderWithProviders(
      <PreviewFileList
        files={[{ id: "f1", name: "a.pdf", url: "blob:a", mimeType: "application/pdf" }]}
      />
    );
    fireEvent.click(screen.getByTitle("Lihat preview"));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getAllByRole("button", { name: "Tutup" })[0]);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<PreviewFileList files={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("FileRowButton", () => {
  it("passes testId to open and remove, with a custom remove label", () => {
    const onOpen = vi.fn();
    const onRemove = vi.fn();
    render(
      <FileRowButton
        icon={null}
        title="Peta"
        testId="row"
        removeLabel="Buang peta"
        onOpen={onOpen}
        onRemove={onRemove}
      />
    );
    fireEvent.click(screen.getByTestId("row"));
    fireEvent.click(screen.getByTestId("row-remove"));
    expect(onOpen).toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Buang peta" })).toBeInTheDocument();
  });
});

describe("UploadState", () => {
  it("renders nothing for a missing or idle item", () => {
    const file = new File(["x"], "a.pdf");
    const { container, rerender } = render(<UploadState item={undefined} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<UploadState item={{ key: "k", file, status: "idle", progress: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("says a canceled upload was canceled, without Ulangi when there is no handler", () => {
    const file = new File(["x"], "a.pdf");
    render(<UploadState item={{ key: "k", file, status: "canceled", progress: 0 }} />);
    expect(screen.getByText("Unggahan dibatalkan")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("hides cancel and retry when no handler is given", () => {
    const file = new File(["x"], "a.pdf");
    const { rerender } = render(
      <UploadState item={{ key: "k", file, status: "uploading", progress: 0.5 }} />
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<UploadState item={{ key: "k", file, status: "error", progress: 0, error: "x" }} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
