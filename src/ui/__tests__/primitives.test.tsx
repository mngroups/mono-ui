import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "../avatar.js";
import { Button, buttonVariants } from "../button.js";
import { Input } from "../input.js";
import { Label } from "../label.js";
import { Separator } from "../separator.js";
import { Skeleton } from "../skeleton.js";
import { Toaster } from "../sonner.js";
import { Switch } from "../switch.js";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../table.js";
import { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants } from "../tabs.js";
import { Textarea } from "../textarea.js";
import { Toggle, toggleVariants } from "../toggle.js";

describe("Avatar", () => {
  it("renders every avatar slot with the default size", () => {
    const { container } = render(
      <AvatarGroup className="group-x">
        <Avatar className="avatar-x">
          <AvatarImage src="/a.png" alt="A" className="img-x" />
          <AvatarFallback className="fb-x">AB</AvatarFallback>
          <AvatarBadge className="badge-x" />
        </Avatar>
        <AvatarGroupCount className="count-x">+3</AvatarGroupCount>
      </AvatarGroup>
    );

    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toHaveAttribute("data-size", "default");
    expect(avatar).toHaveClass("avatar-x");
    expect(container.querySelector('[data-slot="avatar-group"]')).toHaveClass("group-x");
    expect(container.querySelector('[data-slot="avatar-badge"]')).toHaveClass("badge-x");
    expect(screen.getByText("AB")).toHaveClass("fb-x");
    expect(screen.getByText("+3")).toHaveAttribute("data-slot", "avatar-group-count");
  });

  it("accepts an explicit size", () => {
    const { container } = render(<Avatar size="lg" />);
    expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute("data-size", "lg");
  });
});

describe("Button", () => {
  it("renders a PlainButton with the default variant", async () => {
    const onClick = vi.fn();
    render(
      <Button type="button" onClick={onClick}>
        Simpan
      </Button>
    );
    const button = screen.getByRole("button", { name: "Simpan" });
    expect(button).toHaveClass("bg-primary");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders its child via Slot when asChild", () => {
    render(
      <Button asChild variant="link" size="sm">
        <a href="/x">Tautan</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "Tautan" });
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link).toHaveClass("text-primary");
  });

  it("exposes the variant builder", () => {
    expect(buttonVariants({ variant: "destructive", size: "icon" })).toContain("bg-destructive");
  });
});

describe("Input / Textarea / Label", () => {
  it("renders the input with its type and class", () => {
    render(<Input type="email" aria-label="Email" className="in-x" />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveClass("in-x");
  });

  it("renders a textarea", () => {
    render(<Textarea aria-label="Catatan" className="ta-x" />);
    expect(screen.getByRole("textbox", { name: "Catatan" })).toHaveClass("ta-x");
  });

  // Primitives share the look of the Floating* fields: 48px, rounded-xl, border token,
  // primary border on focus with no ring.
  it("styles the input like the floating fields, 48px by default", () => {
    render(<Input aria-label="Nama" />);
    const input = screen.getByRole("textbox", { name: "Nama" });
    expect(input).toHaveAttribute("data-size", "default");
    expect(input).toHaveClass(
      "h-12",
      "rounded-xl",
      "border-border",
      "px-4",
      "text-sm",
      "focus-visible:border-primary"
    );
    expect(input).not.toHaveClass("h-9", "rounded-md", "shadow-xs", "focus-visible:ring-[3px]");
  });

  it("has a compact 36px input size", () => {
    render(<Input aria-label="Cari" size="sm" />);
    const input = screen.getByRole("textbox", { name: "Cari" });
    expect(input).toHaveAttribute("data-size", "sm");
    expect(input).toHaveClass("h-9", "rounded-lg", "px-3");
    expect(input).not.toHaveClass("h-12");
    expect(input).not.toHaveAttribute("size");
  });

  it("styles the textarea like the floating textarea", () => {
    render(<Textarea aria-label="Keterangan" />);
    const textarea = screen.getByRole("textbox", { name: "Keterangan" });
    expect(textarea).toHaveClass(
      "min-h-24",
      "rounded-xl",
      "border-border",
      "px-4",
      "py-3",
      "text-sm",
      "focus-visible:border-primary"
    );
    expect(textarea).not.toHaveClass("rounded-md", "shadow-xs", "focus-visible:ring-[3px]");
  });

  it("links a label to its control", () => {
    render(
      <>
        <Label htmlFor="nama" className="lbl-x">
          Nama
        </Label>
        <input id="nama" />
      </>
    );
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(screen.getByText("Nama")).toHaveClass("lbl-x");
  });
});

describe("Separator", () => {
  it("is decorative and horizontal by default", () => {
    const { container } = render(<Separator />);
    const sep = container.querySelector('[data-slot="separator"]');
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
    expect(sep).toHaveAttribute("role", "none");
  });

  it("can be a semantic vertical separator", () => {
    render(<Separator orientation="vertical" decorative={false} />);
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });
});

describe("Skeleton", () => {
  it("resets the radius for non-circular variants and merges style", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Skeleton ref={ref} className="h-4 w-20" style={{ opacity: 0.5 }} />
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass("rounded-none", "h-4", "w-20");
    expect(el.style.opacity).toBe("0.5");
    expect(el.style.backgroundSize).toBe("200% 100%");
  });

  it("keeps the circular variant round", () => {
    const { container } = render(<Skeleton variant="circular" className="size-8" />);
    expect(container.firstElementChild).toHaveClass("rounded-full");
  });
});

describe("Toaster", () => {
  it("falls back to the system theme", () => {
    render(<Toaster />);
    expect(screen.getByRole("region", { name: /notifications/i })).toBeInTheDocument();
  });

  it("passes the active theme to sonner", () => {
    render(<Toaster theme="dark" position="top-center" />);
    expect(screen.getByRole("region", { name: /notifications/i })).toBeInTheDocument();
  });
});

describe("Switch", () => {
  it("toggles its checked state", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch aria-label="Aktif" onCheckedChange={onCheckedChange} />);
    const sw = screen.getByRole("switch", { name: "Aktif" });
    expect(sw).toHaveAttribute("data-state", "unchecked");
    await userEvent.click(sw);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(sw).toHaveAttribute("data-state", "checked");
  });
});

describe("Table", () => {
  it("renders every table slot and forwards the container ref", () => {
    const containerRef = createRef<HTMLDivElement>();
    render(
      <Table containerRef={containerRef} containerClassName="wrap-x" className="table-x">
        <TableCaption>Daftar</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Kolom</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Isi</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
    expect(screen.getByRole("table", { name: "Daftar" })).toHaveClass("table-x");
    expect(containerRef.current).toHaveClass("wrap-x");
    expect(screen.getByRole("columnheader", { name: "Kolom" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Isi" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Total" })).toBeInTheDocument();
  });
});

describe("Tabs", () => {
  it("switches content when a trigger is activated", async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Konten A</TabsContent>
        <TabsContent value="b">Konten B</TabsContent>
      </Tabs>
    );
    expect(screen.getByText("Konten A")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("Konten B")).toBeInTheDocument();
  });

  it("supports vertical orientation and the line variant", () => {
    const { container } = render(
      <Tabs defaultValue="a" orientation="vertical">
        <TabsList variant="line">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(container.querySelector('[data-slot="tabs"]')).toHaveAttribute(
      "data-orientation",
      "vertical"
    );
    expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "line");
    expect(tabsListVariants({ variant: "line" })).toContain("bg-transparent");
  });
});

describe("Toggle", () => {
  it("toggles its pressed state", async () => {
    render(
      <Toggle aria-label="Tebal" variant="outline" size="sm">
        B
      </Toggle>
    );
    const toggle = screen.getByRole("button", { name: "Tebal" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggleVariants({ size: "lg" })).toContain("h-10");
  });
});
