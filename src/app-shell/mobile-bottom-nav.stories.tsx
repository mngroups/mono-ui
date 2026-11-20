import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, LayoutDashboard, Map as MapIcon, MessagesSquare, Settings } from "lucide-react";
import { type MouseEvent, useState } from "react";

import { mobileStory } from "../../.storybook/docs/mobile";
import { MobileBottomNav } from "./mobile-bottom-nav.js";
import type { AppShellLinkProps, AppShellNavItem } from "./types.js";

const ITEMS: AppShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Peta", icon: MapIcon },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/alert", label: "Alert", icon: Bell },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

function Demo({ dense = false, backdrop }: { dense?: boolean; backdrop: string }) {
  const [pathname, setPathname] = useState("/dashboard");
  const Link = ({ href, ...rest }: AppShellLinkProps) => (
    <a
      href={href}
      {...rest}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setPathname(href);
      }}
    />
  );
  return (
    <div className={`-m-4 h-[600px] ${backdrop}`}>
      <MobileBottomNav items={ITEMS} pathname={pathname} linkComponent={Link} dense={dense} />
    </div>
  );
}

const meta = {
  title: "Components/MobileBottomNav",
  component: MobileBottomNav,
  parameters: {
    docs: {
      importPath: 'import { MobileBottomNav } from "@mono/ui";',
      description: {
        component:
          "Liquid-glass tab bar for phones (hidden from `md` up). `AppShell` renders it from its `bottomNav` prop; use it directly only in a custom shell. Needs `@mono/ui/styles.css` for the glass. Tap the tabs: the lens slides to the active one.",
      },
    },
  },
  args: { items: ITEMS, pathname: "/dashboard" },
  argTypes: { items: { control: false }, linkComponent: { control: false } },
} satisfies Meta<typeof MobileBottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mobile: Story = {
  ...mobileStory,
  render: () => (
    <Demo backdrop="bg-[linear-gradient(160deg,#e0f2fe,#ccfbf1_45%,#fef3c7)] dark:bg-[linear-gradient(160deg,#0c4a6e,#134e4a_45%,#422006)]" />
  ),
};

/** `dense` keeps the glass legible over busy backgrounds such as a satellite map. */
export const MobileDense: Story = {
  ...mobileStory,
  render: () => (
    <Demo dense backdrop="bg-[repeating-linear-gradient(45deg,#14532d_0_24px,#3f6212_24px_48px)]" />
  ),
};
