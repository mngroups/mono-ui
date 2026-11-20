import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";

import { mobileStory } from "../../.storybook/docs/mobile";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel.js";

const sites = [
  { name: "Site Sangatta", ton: "12.480", fuel: "3.210" },
  { name: "Site Tabang", ton: "9.875", fuel: "2.640" },
  { name: "Site Melak", ton: "7.120", fuel: "1.980" },
  { name: "Site Batu Hijau", ton: "15.300", fuel: "4.050" },
  { name: "Site Kideco", ton: "6.540", fuel: "1.720" },
];

function SiteCard({ site }: { site: (typeof sites)[number] }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-sm text-muted-foreground">{site.name}</p>
      <p className="mt-1 text-2xl font-bold">{site.ton} ton</p>
      <p className="text-xs text-muted-foreground">Fuel {site.fuel} L</p>
    </div>
  );
}

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  parameters: {
    docs: {
      importPath:
        'import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@mono/ui";',
    },
  },
  args: { orientation: "horizontal", opts: { align: "start" } },
  argTypes: { orientation: { control: "inline-radio", options: ["horizontal", "vertical"] } },
  render: (args) => (
    <div className="mx-12 max-w-2xl">
      <Carousel {...args}>
        <CarouselContent>
          {sites.map((site) => (
            <CarouselItem key={site.name} className="basis-1/2 md:basis-1/3">
              <SiteCard site={site} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One full-width slide at a time; `loop` wraps around at the ends. */
export const SingleSlideLoop: Story = {
  args: { opts: { loop: true } },
  render: (args) => (
    <div className="mx-12 max-w-sm">
      <Carousel {...args}>
        <CarouselContent>
          {sites.map((site) => (
            <CarouselItem key={site.name}>
              <SiteCard site={site} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

/** `setApi` hands you the Embla API, e.g. for a slide counter. */
export const WithCounter: Story = {
  render: function Render(args) {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(1);
    useEffect(() => {
      if (!api) return;
      setCurrent(api.selectedScrollSnap() + 1);
      api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
    }, [api]);
    return (
      <div className="mx-12 max-w-sm space-y-2">
        <Carousel {...args} setApi={setApi}>
          <CarouselContent>
            {sites.map((site) => (
              <CarouselItem key={site.name}>
                <SiteCard site={site} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <p className="text-center text-xs text-muted-foreground">
          Slide {current} dari {sites.length}
        </p>
      </div>
    );
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="my-12 max-w-xs">
      <Carousel {...args}>
        <CarouselContent className="h-60">
          {sites.map((site) => (
            <CarouselItem key={site.name} className="basis-1/2">
              <SiteCard site={site} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

/**
 * On phones, `bleed` on `CarouselContent` runs the rail edge-to-edge past the page's `px-4` gutter;
 * swipe instead of using arrows.
 */
export const MobileBleed: Story = {
  ...mobileStory,
  render: (args) => (
    <div className="px-4">
      <p className="mb-2 text-sm font-semibold">Produksi per site</p>
      <Carousel {...args}>
        <CarouselContent bleed>
          {sites.map((site) => (
            <CarouselItem key={site.name} className="basis-[80%]">
              <SiteCard site={site} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  ),
};
