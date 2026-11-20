import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../carousel.js";

type Handler = (api: unknown) => void;

const embla = vi.hoisted(() => {
  const handlers: Record<string, ((api: unknown) => void)[]> = {};
  const api = {
    canPrev: false,
    canNext: true,
    canScrollPrev: () => api.canPrev,
    canScrollNext: () => api.canNext,
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    on: vi.fn((event: string, cb: (api: unknown) => void) => {
      handlers[event] = [...(handlers[event] ?? []), cb];
    }),
    off: vi.fn(),
  };
  return { api, handlers, current: api as unknown, lastOptions: undefined as unknown };
});

vi.mock("embla-carousel-react", () => ({
  default: (opts: unknown) => {
    embla.lastOptions = opts;
    return [vi.fn(), embla.current];
  },
}));

function emit(event: string) {
  act(() => {
    for (const cb of embla.handlers[event] ?? []) (cb as Handler)(embla.api);
  });
}

beforeEach(() => {
  embla.api.canPrev = false;
  embla.api.canNext = true;
  embla.current = embla.api;
  for (const key of Object.keys(embla.handlers)) delete embla.handlers[key];
  vi.clearAllMocks();
});

function Demo(props: Partial<React.ComponentProps<typeof Carousel>> & { bleed?: boolean }) {
  const { bleed, ...rest } = props;
  return (
    <Carousel {...rest}>
      <CarouselContent bleed={bleed}>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

describe("Carousel", () => {
  it("throws when a part is used outside <Carousel>", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<CarouselItem />)).toThrow(
      "useCarousel must be used within a <Carousel />"
    );
    spy.mockRestore();
  });

  it("wires the arrow buttons, the keyboard and the select events", async () => {
    const user = userEvent.setup();
    const setApi = vi.fn();
    const { unmount } = render(<Demo setApi={setApi} bleed />);
    expect(setApi).toHaveBeenCalledWith(embla.api);
    expect(embla.lastOptions).toMatchObject({ axis: "x" });

    const prev = screen.getByRole("button", { name: "Sebelumnya" });
    const next = screen.getByRole("button", { name: "Berikutnya" });
    expect(prev).toBeDisabled();
    expect(next).toBeEnabled();

    await user.click(next);
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(1);

    embla.api.canPrev = true;
    emit("select");
    expect(prev).toBeEnabled();
    await user.click(prev);
    expect(embla.api.scrollPrev).toHaveBeenCalledTimes(1);

    embla.api.canNext = false;
    emit("reInit");
    expect(next).toBeDisabled();

    const region = screen.getByRole("region");
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    fireEvent.keyDown(region, { key: "ArrowRight" });
    fireEvent.keyDown(region, { key: "Enter" });
    expect(embla.api.scrollPrev).toHaveBeenCalledTimes(2);
    expect(embla.api.scrollNext).toHaveBeenCalledTimes(2);

    // The bleed spacer only renders on a horizontal rail.
    expect(region.querySelector('div[aria-hidden="true"]')).not.toBeNull();

    unmount();
    expect(embla.api.off).toHaveBeenCalledWith("select", expect.any(Function));
    expect(embla.api.off).toHaveBeenCalledWith("reInit", expect.any(Function));
  });

  it("lays out vertically without bleed", () => {
    render(<Demo orientation="vertical" bleed />);
    expect(embla.lastOptions).toMatchObject({ axis: "y" });
    expect(screen.getAllByRole("group")[0]).toHaveClass("pt-4");
    expect(screen.getByRole("region").querySelector('div[aria-hidden="true"]')).toBeNull();
  });

  it.each([
    [{ axis: "y" } as const, "pt-4"],
    [undefined, "pl-4"],
  ])("falls back to opts.axis for an empty orientation (%o)", (opts, cls) => {
    // `orientation` defaults to "horizontal", so the fallback only runs for a
    // falsy value smuggled past the type.
    render(<Demo orientation={"" as "horizontal"} opts={opts} />);
    expect(screen.getAllByRole("group")[0]).toHaveClass(cls);
  });

  it("does nothing before embla hands over its api", async () => {
    embla.current = undefined;
    const setApi = vi.fn();
    render(<Demo setApi={setApi} />);
    expect(setApi).not.toHaveBeenCalled();
    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowRight" });
    fireEvent.keyDown(screen.getByRole("region"), { key: "ArrowLeft" });
    expect(embla.api.scrollNext).not.toHaveBeenCalled();
    expect(embla.api.scrollPrev).not.toHaveBeenCalled();
  });

  it("ignores a select event without an api", () => {
    render(<Demo />);
    act(() => {
      for (const cb of embla.handlers.select ?? []) (cb as Handler)(undefined);
    });
    expect(screen.getByRole("button", { name: "Berikutnya" })).toBeEnabled();
  });
});
