import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DraftFileNotice } from "../draft-file-notice.js";

describe("DraftFileNotice", () => {
  it("renders nothing without files", () => {
    const { container } = render(<DraftFileNotice fileNames={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("asks the user to pick the listed files again", () => {
    render(<DraftFileNotice fileNames={["a.pdf", "b.zip"]} />);
    expect(screen.getByTestId("draft-file-notice")).toHaveTextContent(
      "File sebelumnya (a.pdf, b.zip) perlu dipilih ulang."
    );
  });
});
