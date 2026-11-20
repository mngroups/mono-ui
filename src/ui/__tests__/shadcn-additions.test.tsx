import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "../alert.js";
import { Badge } from "../badge.js";
import { Checkbox } from "../checkbox.js";
import { RadioGroup, RadioGroupItem } from "../radio-group.js";

describe("Badge", () => {
  it("renders a span with the variant classes", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK").tagName).toBe("SPAN");
    expect(screen.getByText("OK")).toHaveAttribute("data-slot", "badge");
  });

  it("renders its child with asChild", () => {
    render(
      <Badge asChild>
        <a href="#x">Lihat detail</a>
      </Badge>
    );
    expect(screen.getByRole("link", { name: "Lihat detail" })).toHaveAttribute(
      "data-slot",
      "badge"
    );
  });
});

describe("Alert", () => {
  it("renders an alert with title and description", () => {
    render(
      <Alert variant="warning">
        <AlertTitle>Perhatian</AlertTitle>
        <AlertDescription>Isi</AlertDescription>
      </Alert>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("PerhatianIsi");
  });
});

describe("Checkbox", () => {
  it("toggles and reports its checked state", async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox aria-label="Setuju" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Setuju" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("checkbox", { name: "Setuju" })).toBeChecked();
  });
});

describe("RadioGroup", () => {
  it("selects the clicked item", async () => {
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Pilihan" onValueChange={onValueChange}>
        <RadioGroupItem value="a" aria-label="A" />
        <RadioGroupItem value="b" aria-label="B" />
      </RadioGroup>
    );
    await userEvent.click(screen.getByRole("radio", { name: "B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByRole("radio", { name: "B" })).toBeChecked();
  });
});
