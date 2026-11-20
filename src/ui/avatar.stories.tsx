import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check } from "lucide-react";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./avatar.js";

// Inline picture so the docs work offline; in the app this is the user's photo URL.
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0097b2"/><circle cx="32" cy="25" r="11" fill="#e0f4f8"/><path d="M12 58c2-12 10-18 20-18s18 6 20 18z" fill="#e0f4f8"/></svg>'
)}`;

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    docs: {
      importPath:
        'import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from "@mono/ui";',
    },
  },
  args: { size: "default" },
  argTypes: { size: { control: "select", options: ["sm", "default", "lg"] } },
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={PHOTO} alt="Budi Santoso" />
      <AvatarFallback>BS</AvatarFallback>
    </Avatar>
  ),
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Initials show while the image loads, or when there is no image or it fails. */
export const Fallback: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args}>
        <AvatarFallback>RA</AvatarFallback>
      </Avatar>
      <Avatar {...args}>
        <AvatarImage src="/tidak-ada.png" alt="Siti Rahma" />
        <AvatarFallback>SR</AvatarFallback>
      </Avatar>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
    </div>
  ),
};

/** `AvatarBadge` is a status dot; an icon inside shows from the default size up. */
export const WithBadge: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src={PHOTO} alt="Operator" />
        <AvatarFallback>OP</AvatarFallback>
        <AvatarBadge className="bg-emerald-500" />
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>PK</AvatarFallback>
        <AvatarBadge>
          <Check />
        </AvatarBadge>
      </Avatar>
    </div>
  ),
};

/** Overlapping stack with an overflow count, e.g. the crew on a shift. */
export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src={PHOTO} alt="Budi" />
        <AvatarFallback>BS</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>AW</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>DP</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+8</AvatarGroupCount>
    </AvatarGroup>
  ),
};
