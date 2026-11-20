import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { BottomSheet } from "../bottom-sheet.js";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu.js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover.js";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../select.js";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip.js";

const mobile = vi.hoisted(() => ({ value: false }));

vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => mobile.value,
}));

beforeAll(() => {
  // Radix Select / DismissableLayer call these; jsdom doesn't implement them.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => {};
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

beforeEach(() => {
  mobile.value = false;
});

describe("BottomSheet", () => {
  it("renders an open sheet with a title into the body and closes on backdrop click", () => {
    const onClose = vi.fn();
    render(
      <BottomSheet isOpen onClose={onClose} title="Filter" maxHeight="50vh">
        <p>Isi</p>
      </BottomSheet>
    );
    expect(screen.getByRole("heading", { name: "Filter" })).toBeInTheDocument();
    const body = screen.getByText("Isi").parentElement as HTMLElement;
    expect(body).toHaveClass("overflow-y-auto");
    const backdrop = document.body.querySelector(".bg-black\\/40") as HTMLElement;
    expect(backdrop.style.opacity).toBe("1");
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the backdrop when closed and lets the child own scrolling", () => {
    render(
      <BottomSheet isOpen={false} onClose={vi.fn()} scrollBody={false}>
        <p>Daftar</p>
      </BottomSheet>
    );
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    const body = screen.getByText("Daftar").parentElement as HTMLElement;
    expect(body).toHaveClass("min-h-0");
    const backdrop = document.body.querySelector(".bg-black\\/40") as HTMLElement;
    expect(backdrop.style.opacity).toBe("0");
    expect(backdrop.style.pointerEvents).toBe("none");
  });
});

describe("DropdownMenu", () => {
  it("renders every menu slot when open", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent className="content-x">
          <DropdownMenuLabel inset>Akun</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profil <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" inset>
              Hapus
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuCheckboxItem checked>Tampilkan</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Opsi A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Opsi B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger inset>Lainnya</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="sub-x">
                <DropdownMenuItem>Sub item</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.getByText("Akun")).toHaveAttribute("data-inset", "true");
    expect(screen.getByRole("menuitem", { name: /Hapus/ })).toHaveAttribute(
      "data-variant",
      "destructive"
    );
    expect(screen.getByRole("menuitem", { name: /Profil/ })).toHaveAttribute(
      "data-variant",
      "default"
    );
    expect(screen.getByRole("menuitemcheckbox", { name: "Tampilkan" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("menuitemradio", { name: "Opsi A" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    expect(screen.getByRole("menuitem", { name: "Lainnya" })).toHaveAttribute("data-inset", "true");
    expect(screen.getByText("Sub item")).toBeInTheDocument();
    expect(screen.getByText("⌘P")).toHaveAttribute("data-slot", "dropdown-menu-shortcut");
  });
});

describe("Select", () => {
  it("renders an open item-aligned select with groups and picks a value", async () => {
    const onValueChange = vi.fn();
    render(
      <Select defaultOpen onValueChange={onValueChange}>
        <SelectTrigger aria-label="Situs" size="sm">
          <SelectValue placeholder="Pilih situs" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Situs</SelectLabel>
            <SelectItem value="a">Situs A</SelectItem>
            <SelectSeparator />
            <SelectItem value="b">Situs B</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("option", { name: "Situs B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("draws the trigger border with the themed input token", () => {
    render(
      <Select>
        <SelectTrigger aria-label="Unit">
          <SelectValue placeholder="Pilih unit" />
        </SelectTrigger>
      </Select>
    );
    const trigger = screen.getByRole("combobox", { name: "Unit" });
    // border-white vanishes on the light background; the border token works in both themes.
    expect(trigger).toHaveClass("border-border");
    expect(trigger).not.toHaveClass("border-white");
  });

  it("styles the trigger like the floating fields: 48px default, 36px sm", () => {
    render(
      <>
        <Select>
          <SelectTrigger aria-label="Default">
            <SelectValue placeholder="Pilih" />
          </SelectTrigger>
        </Select>
        <Select>
          <SelectTrigger aria-label="Kecil" size="sm">
            <SelectValue placeholder="Pilih" />
          </SelectTrigger>
        </Select>
      </>
    );
    const trigger = screen.getByRole("combobox", { name: "Default" });
    expect(trigger).toHaveClass(
      "data-[size=default]:h-12",
      "data-[size=sm]:h-9",
      "rounded-xl",
      "data-[size=sm]:rounded-lg",
      "px-4",
      "data-[size=sm]:px-3",
      "focus-visible:border-primary"
    );
    expect(trigger).not.toHaveClass("rounded-md", "shadow-xs", "focus-visible:ring-[3px]");
    expect(screen.getByRole("combobox", { name: "Kecil" })).toHaveAttribute("data-size", "sm");
  });

  it("renders popper-positioned content", () => {
    render(
      <Select defaultOpen defaultValue="a">
        <SelectTrigger aria-label="Kontraktor">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper" className="popper-x">
          <SelectItem value="a">Kontraktor A</SelectItem>
        </SelectContent>
      </Select>
    );
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveClass("popper-x");
    expect(listbox.className).toContain("data-[side=bottom]:translate-y-1");
    expect(screen.getByRole("combobox", { name: "Kontraktor", hidden: true })).toHaveAttribute(
      "data-size",
      "default"
    );
  });
});

describe("Sheet", () => {
  it.each(["right", "left", "top", "bottom"] as const)("opens from the %s side", async (side) => {
    render(
      <Sheet>
        <SheetTrigger>Buka</SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Judul</SheetTitle>
            <SheetDescription>Deskripsi</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <SheetClose>Tutup sheet</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
    await userEvent.click(screen.getByRole("button", { name: "Buka" }));
    const dialog = screen.getByRole("dialog", { name: "Judul" });
    expect(dialog).toHaveAttribute("data-slot", "sheet-content");
    expect(screen.getByText("Deskripsi")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("can hide the built-in close button", () => {
    render(
      <Sheet open>
        <SheetContent showCloseButton={false}>
          <SheetTitle>Tanpa tombol</SheetTitle>
          <SheetDescription>-</SheetDescription>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });
});

describe("Popover", () => {
  it("renders a controlled Radix popover on desktop", async () => {
    const onOpenChange = vi.fn();
    render(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger>Info</PopoverTrigger>
        <PopoverContent className="pop-x">Isi popover</PopoverContent>
      </Popover>
    );
    expect(screen.getByText("Isi popover")).toHaveClass("pop-x");
    await userEvent.click(screen.getByRole("button", { name: "Info" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("keeps the desktop popover on mobile when there is no content", () => {
    mobile.value = true;
    render(
      <Popover>
        <PopoverTrigger>Info</PopoverTrigger>
      </Popover>
    );
    expect(screen.getByRole("button", { name: "Info" })).toBeInTheDocument();
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("opens the content in a bottom sheet on mobile and forwards trigger handlers", async () => {
    mobile.value = true;
    const handlers = {
      onClick: vi.fn(),
      onPointerEnter: vi.fn(),
      onPointerLeave: vi.fn(),
      onMouseEnter: vi.fn(),
      onMouseLeave: vi.fn(),
    };
    const onOpenChange = vi.fn();
    render(
      <Popover onOpenChange={onOpenChange}>
        <PopoverTrigger {...handlers}>Info</PopoverTrigger>
        <PopoverContent>Isi mobile</PopoverContent>
      </Popover>
    );
    const trigger = screen.getByRole("button", { name: "Info" });
    const backdrop = document.body.querySelector(".bg-black\\/40") as HTMLElement;
    expect(backdrop.style.opacity).toBe("0");

    fireEvent.pointerEnter(trigger);
    fireEvent.pointerLeave(trigger);
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    expect(handlers.onPointerEnter).toHaveBeenCalled();
    expect(handlers.onPointerLeave).toHaveBeenCalled();
    expect(handlers.onMouseEnter).toHaveBeenCalled();
    expect(handlers.onMouseLeave).toHaveBeenCalled();

    fireEvent.click(trigger);
    expect(handlers.onClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(backdrop.style.opacity).toBe("1");
    expect(screen.getByText("Isi mobile")).toBeInTheDocument();

    fireEvent.click(backdrop);
    expect(backdrop.style.opacity).toBe("0");
  });

  it("does not toggle on mobile when the trigger's onClick prevents default", () => {
    mobile.value = true;
    render(
      <Popover>
        <PopoverTrigger onClick={(e) => e.preventDefault()}>Info</PopoverTrigger>
        <PopoverContent>Isi</PopoverContent>
      </Popover>
    );
    const trigger = screen.getByRole("button", { name: "Info" });
    fireEvent.pointerEnter(trigger);
    fireEvent.pointerLeave(trigger);
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    fireEvent.click(trigger);
    const backdrop = document.body.querySelector(".bg-black\\/40") as HTMLElement;
    expect(backdrop.style.opacity).toBe("0");
  });
});

describe("mobile trigger toggling", () => {
  it.each([
    [
      "Popover",
      () => (
        <Popover>
          <PopoverTrigger>Buka</PopoverTrigger>
          <PopoverContent>Isi</PopoverContent>
        </Popover>
      ),
    ],
    [
      "Tooltip",
      () => (
        <Tooltip>
          <TooltipTrigger>Buka</TooltipTrigger>
          <TooltipContent>Isi</TooltipContent>
        </Tooltip>
      ),
    ],
  ])("%s: one tap opens, the next tap closes (touch and mouse)", async (_name, Ui) => {
    mobile.value = true;
    const user = userEvent.setup();
    render(<Ui />);
    const trigger = screen.getByRole("button", { name: "Buka" });
    const backdrop = document.body.querySelector(".bg-black\\/40") as HTMLElement;
    const tap = () => user.pointer({ keys: "[TouchA]", target: trigger });
    await tap();
    expect(backdrop.style.opacity).toBe("1");
    await tap();
    expect(backdrop.style.opacity).toBe("0");
    // A mouse (narrow desktop window): hovering must not open it before the click.
    await user.click(trigger);
    expect(backdrop.style.opacity).toBe("1");
    await user.click(trigger);
    expect(backdrop.style.opacity).toBe("0");
  });
});

describe("Tooltip", () => {
  it("renders a controlled Radix tooltip on desktop with and without an arrow", () => {
    const { rerender } = render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Bantuan</TooltipTrigger>
          <TooltipContent className="tip-x">Teks bantuan</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getAllByText("Teks bantuan")[0]).toBeInTheDocument();
    expect(document.body.querySelector("svg")).not.toBeNull();

    rerender(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>Bantuan</TooltipTrigger>
          <TooltipContent showArrow={false}>Tanpa panah</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getAllByText("Tanpa panah")[0]).toBeInTheDocument();
    expect(document.body.querySelector("svg")).toBeNull();
  });

  it("renders only the trigger's children on mobile when disableMobile is set", () => {
    mobile.value = true;
    render(
      <Tooltip disableMobile>
        <TooltipTrigger>
          <span>Aksi</span>
        </TooltipTrigger>
        <TooltipContent>Tip</TooltipContent>
      </Tooltip>
    );
    expect(screen.getByText("Aksi")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("falls back to the Radix tooltip on mobile without content", () => {
    mobile.value = true;
    render(
      <Tooltip>
        <TooltipTrigger>Bantuan</TooltipTrigger>
      </Tooltip>
    );
    expect(screen.getByRole("button", { name: "Bantuan" })).toBeInTheDocument();
  });

  it("opens the content in a bottom sheet on mobile and forwards trigger handlers", () => {
    mobile.value = true;
    const handlers = {
      onClick: vi.fn(),
      onPointerEnter: vi.fn(),
      onPointerLeave: vi.fn(),
      onMouseEnter: vi.fn(),
      onMouseLeave: vi.fn(),
    };
    const onOpenChange = vi.fn();
    render(
      <Tooltip onOpenChange={onOpenChange}>
        <TooltipTrigger {...handlers}>Bantuan</TooltipTrigger>
        <TooltipContent>Isi tooltip</TooltipContent>
      </Tooltip>
    );
    const trigger = screen.getByRole("button", { name: "Bantuan" });
    const backdrop = document.body.querySelector(".bg-black\\/40") as HTMLElement;

    fireEvent.pointerEnter(trigger);
    fireEvent.pointerLeave(trigger);
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    expect(handlers.onPointerEnter).toHaveBeenCalled();
    expect(handlers.onPointerLeave).toHaveBeenCalled();
    expect(handlers.onMouseEnter).toHaveBeenCalled();
    expect(handlers.onMouseLeave).toHaveBeenCalled();

    fireEvent.click(trigger);
    expect(handlers.onClick).toHaveBeenCalled();
    expect(backdrop.style.opacity).toBe("1");
    expect(screen.getByText("Isi tooltip")).toBeInTheDocument();

    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(backdrop);
    expect(backdrop.style.opacity).toBe("0");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    // Focus alone (Radix's own open trigger) doesn't open the sheet.
    fireEvent.focus(trigger);
    expect(backdrop.style.opacity).toBe("0");
  });

  it("does not toggle on mobile when the trigger's onClick prevents default", () => {
    mobile.value = true;
    render(
      <Tooltip>
        <TooltipTrigger onClick={(e) => e.preventDefault()}>Bantuan</TooltipTrigger>
        <TooltipContent>Isi</TooltipContent>
      </Tooltip>
    );
    const trigger = screen.getByRole("button", { name: "Bantuan" });
    fireEvent.pointerEnter(trigger);
    fireEvent.pointerLeave(trigger);
    fireEvent.mouseEnter(trigger);
    fireEvent.mouseLeave(trigger);
    fireEvent.click(trigger);
    const backdrop = document.body.querySelector(".bg-black\\/40") as HTMLElement;
    expect(backdrop.style.opacity).not.toBe("1");
  });
});
