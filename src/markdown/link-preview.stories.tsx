import type { Meta, StoryObj } from "@storybook/react-vite";

import { LinkPreview } from "./link-preview.js";

const meta = {
  title: "Components/LinkPreview",
  component: LinkPreview,
  parameters: {
    docs: { importPath: 'import { LinkPreview } from "@mono/ui/markdown";' },
  },
  args: {
    href: "https://berita.example.com/news/20261120-produsen-batubara-fokus-garap-pasar-domestik",
    children: "Produsen batu bara fokus garap pasar domestik",
  },
  argTypes: {
    href: { control: "text" },
    children: { control: "text" },
  },
} satisfies Meta<typeof LinkPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** When the link text is the URL itself, the title is built from the last path segment. */
export const TitleFromUrl: Story = {
  args: {
    href: "https://www.example.org/berita-unit/harga-batubara-acuan-november-2026",
    children: "https://www.example.org/berita-unit/harga-batubara-acuan-november-2026",
  },
};

/** With no usable path the domain is shown as the title. */
export const DomainOnly: Story = {
  args: { href: "https://www.example.com/", children: "https://www.example.com/" },
};

/** A list of sources under a chat answer. */
export const SourceList: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-1 md:grid-cols-2">
      <LinkPreview href="https://berita.example.com/news/20261120-produsen-batubara-fokus-garap-pasar-domestik">
        Produsen batu bara fokus garap pasar domestik
      </LinkPreview>
      <LinkPreview href="https://www.example.org/berita-unit/harga-batubara-acuan-november-2026">
        https://www.example.org/berita-unit/harga-batubara-acuan-november-2026
      </LinkPreview>
      <LinkPreview href="https://example.net/berita/produksi-batu-bara-nasional-2026">
        Produksi batu bara nasional 2026
      </LinkPreview>
    </div>
  ),
};
