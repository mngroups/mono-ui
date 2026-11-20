"use client";

import { cn } from "@mono/utils";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import * as React from "react";
import { PlainButton } from "./plain-button.js";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  /** Embla options, e.g. `{ align: "start", loop: true }`. */
  opts?: CarouselOptions;
  /** Embla plugins, e.g. autoplay. */
  plugins?: CarouselPlugin;
  /** Scroll axis. */
  orientation?: "horizontal" | "vertical";
  /** Receives the Embla API, for a slide counter or custom controls. */
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

/**
 * Swipeable slide rail (shadcn/ui, Embla) built from `CarouselContent`, `CarouselItem`, and the
 * round `CarouselPrevious` / `CarouselNext` buttons. Arrow keys scroll too. Set slide width with
 * `basis-*` classes on `CarouselItem`.
 */
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    { ...opts, axis: orientation === "horizontal" ? "x" : "y" },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return;
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api?.off("reInit", onSelect);
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  bleed = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Mobile, horizontal only: run the rail edge-to-edge past the page's px-4
   * gutter (see `mobile-bleed-x`). Embla snaps against the viewport and sizes
   * from the slides, so padding can't add the gutter here: the first slide's
   * own pl-4 becomes the leading gutter and a trailing spacer the closing one.
   */
  bleed?: boolean;
}) {
  const { carouselRef, orientation } = useCarousel();
  const isBleed = bleed && orientation === "horizontal";

  return (
    <div
      ref={carouselRef}
      className={cn("overflow-hidden", isBleed && "-mx-4 md:mx-0")}
      data-slot="carousel-content"
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          isBleed && "ml-0 md:-ml-4",
          className
        )}
        {...props}
      >
        {children}
        {isBleed && <div aria-hidden className="w-4 shrink-0 md:hidden" />}
      </div>
    </div>
  );
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  );
}

function CarouselPrevious({ className, ...props }: React.ComponentProps<"button">) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <PlainButton
      type="button"
      data-slot="carousel-previous"
      className={cn(
        "absolute inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-foreground/15 bg-card text-foreground/70 shadow-sm transition-colors hover:bg-foreground/[0.04] disabled:pointer-events-none disabled:opacity-0",
        // inset + auto margin centres against the full track height, which
        // top-1/2 does not once the track and container heights differ.
        orientation === "horizontal"
          ? "inset-y-0 -left-5 my-auto"
          : "inset-x-0 -top-3 mx-auto rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft size={18} />
      <span className="sr-only">Sebelumnya</span>
    </PlainButton>
  );
}

function CarouselNext({ className, ...props }: React.ComponentProps<"button">) {
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  return (
    <PlainButton
      type="button"
      data-slot="carousel-next"
      className={cn(
        "absolute inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-foreground/15 bg-card text-foreground/70 shadow-sm transition-colors hover:bg-foreground/[0.04] disabled:pointer-events-none disabled:opacity-0",
        orientation === "horizontal"
          ? "inset-y-0 -right-5 my-auto"
          : "inset-x-0 -bottom-3 mx-auto rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight size={18} />
      <span className="sr-only">Berikutnya</span>
    </PlainButton>
  );
}

export {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
};
