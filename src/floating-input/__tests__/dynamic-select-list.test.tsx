import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Form } from "../../ui/form.js";
import { DynamicSelectList } from "../dynamic-select-list.js";

vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => false,
}));

beforeAll(() => {
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

const OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "pic", label: "PIC" },
];

type Values = { roles: { value: string }[] };

function Harness({
  testIdPrefix,
  defaultValues = { roles: [{ value: "admin" }] },
}: {
  testIdPrefix?: string;
  defaultValues?: Partial<Values>;
}) {
  const form = useForm<Values>({ defaultValues });
  return (
    <Form {...form}>
      <form>
        <DynamicSelectList
          control={form.control}
          name="roles"
          label="Role"
          addLabel="Role lain"
          options={OPTIONS}
          testIdPrefix={testIdPrefix}
        />
      </form>
    </Form>
  );
}

describe("DynamicSelectList", () => {
  it("adds rows, excludes options picked elsewhere and removes rows", async () => {
    const user = userEvent.setup();
    render(<Harness testIdPrefix="roles" />);
    expect(screen.queryByRole("button", { name: "Hapus role 1" })).not.toBeInTheDocument();

    await user.click(screen.getByTestId("roles-add"));
    expect(screen.getByTestId("roles-remove-0")).toBeInTheDocument();
    await user.click(screen.getByTestId("roles-select-1"));
    const listbox = await screen.findByRole("listbox");
    // "Admin" is already picked in row 1.
    expect(within(listbox).queryByText("Admin")).not.toBeInTheDocument();
    await user.click(within(listbox).getByText("PIC"));
    expect(screen.getByTestId("roles-select-1")).toHaveTextContent("PIC");

    await user.click(screen.getByRole("button", { name: "Hapus role 1" }));
    expect(screen.queryByTestId("roles-select-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("roles-select-0")).toHaveTextContent("PIC");
  });

  it("renders without test ids when no prefix is given", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: /Role lain/ }));
    expect(screen.getAllByRole("button", { name: /Hapus role/ })).toHaveLength(2);
    expect(screen.queryByTestId("roles-add")).not.toBeInTheDocument();
  });

  it("starts with no rows when the form has no value for the list yet", async () => {
    const user = userEvent.setup();
    render(<Harness testIdPrefix="roles" defaultValues={{}} />);
    expect(screen.queryByTestId("roles-select-0")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("roles-add"));
    expect(screen.getByTestId("roles-select-0")).toBeInTheDocument();
  });
});
