import { describe, expect, it } from "vitest";

import {
  DEFAULT_ACCEPT,
  parseAcceptedExts,
  uniqueFileName,
  validateFile,
} from "../validate-file.js";

const sized = (name: string, bytes: number) => new File([new Uint8Array(bytes)], name);

describe("validate-file", () => {
  it("parses the extensions out of an accept string", () => {
    expect(parseAcceptedExts(" .PDF, image/png ,.zip")).toEqual([".pdf", ".zip"]);
    expect(DEFAULT_ACCEPT).toBe(".pdf,.doc,.docx,.jpg,.jpeg,.png");
  });

  it("rejects a wrong extension and an oversize file in Indonesian", () => {
    expect(validateFile(sized("a.exe", 1), [".pdf", ".png"], 5)).toBe(
      "Format file tidak didukung. Harap upload file .pdf, .png."
    );
    expect(validateFile(sized("a.pdf", 2 * 1024 * 1024), [".pdf"], 1)).toBe(
      "Ukuran file melebihi batas maksimal 1 MB."
    );
    expect(validateFile(sized("A.PDF", 10), [".pdf"], 1)).toBeNull();
    expect(validateFile(sized("a.pdf", 10 * 1024 * 1024), [".pdf"], 0)).toBeNull();
  });

  it("numbers a taken name, keeping the extension", () => {
    const taken = new Set(["laporan.pdf", "laporan (1).pdf"]);
    expect(uniqueFileName("laporan.pdf", taken)).toBe("laporan (2).pdf");
    expect(uniqueFileName("baru.pdf", taken)).toBe("baru.pdf");
    expect(uniqueFileName("README", new Set(["README"]))).toBe("README (1)");
  });
});
