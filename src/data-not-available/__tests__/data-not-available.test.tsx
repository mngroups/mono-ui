import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DataNotAvailable } from "../data-not-available.js";

describe("DataNotAvailable", () => {
  it("renders the default copy without an image", () => {
    const { container } = render(<DataNotAvailable />);
    expect(screen.getByText("Data belum tersedia")).toBeInTheDocument();
    expect(screen.getByText(/belum diperbarui/)).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders a clickable image and hides the description", () => {
    const onImageClick = vi.fn();
    const { container } = render(
      <DataNotAvailable
        image="/empty.png"
        imageSize={80}
        title="Kosong"
        description={null}
        onImageClick={onImageClick}
      />
    );
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).toHaveAttribute("src", "/empty.png");
    expect(img).toHaveAttribute("width", "80");
    expect(img).toHaveClass("cursor-pointer");
    fireEvent.click(img);
    expect(onImageClick).toHaveBeenCalled();
    expect(screen.queryByText(/belum diperbarui/)).not.toBeInTheDocument();
  });

  it("renders a static image without the pointer cursor", () => {
    const { container } = render(<DataNotAvailable image="/empty.png" />);
    expect(container.querySelector("img")).not.toHaveClass("cursor-pointer");
  });
});
