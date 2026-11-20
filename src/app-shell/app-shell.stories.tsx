import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  Fuel,
  KeyRound,
  LayoutDashboard,
  List,
  Map as MapIcon,
  Settings,
  Settings2,
  Truck,
  UserCog,
} from "lucide-react";
import { type MouseEvent, useState } from "react";

import { mobileStory } from "../../.storybook/docs/mobile";
import { PageHeader } from "../page-header/page-header.js";
import { AppShell } from "./app-shell.js";
import type { AppShellEntry, AppShellLinkProps, AppShellNavItem } from "./types.js";

const MENU: AppShellEntry[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Peta", icon: MapIcon },
  { href: "/fuel", label: "Fuel", icon: Fuel },
  { href: "/alert", label: "Alert dan Task", icon: List },
  { href: "/contractor", label: "Kontraktor", icon: BriefcaseBusiness },
  {
    kind: "group",
    id: "unit-management",
    label: "Unit Management",
    icon: Truck,
    children: [
      { href: "/unit/configuration", label: "Konfigurasi", icon: Settings2 },
      { href: "/unit/contractor-mapping", label: "Mapping Kontraktor", icon: Building2 },
    ],
  },
];

const BOTTOM_NAV: AppShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Peta", icon: MapIcon },
  { href: "/alert", label: "Alert", icon: Bell },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/map": "Peta",
  "/fuel": "Fuel",
  "/alert": "Alert dan Task",
  "/contractor": "Kontraktor",
  "/unit/configuration": "Konfigurasi Unit",
  "/unit/contractor-mapping": "Mapping Kontraktor",
  "/settings": "Pengaturan",
  "/profile": "Profil",
};

const Brand = () => <img src="mono-ui-logo.png" alt="MoNo UI" className="h-10 w-auto" />;
const BrandMark = () => <img src="mono-ui-logo.png" alt="MoNo UI" className="h-8 w-auto" />;

/** Story harness: the links update local state instead of leaving the page. */
function Shell({
  initialPath,
  ...props
}: Partial<React.ComponentProps<typeof AppShell>> & { initialPath: string }) {
  const [pathname, setPathname] = useState(initialPath);
  const Link = ({ href, onClick, ...rest }: AppShellLinkProps) => (
    <a
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onClick?.(event);
        setPathname(href);
      }}
      {...rest}
    />
  );
  return (
    <AppShell
      menu={MENU}
      pathname={pathname}
      linkComponent={Link}
      brand={<Brand />}
      brandMark={<BrandMark />}
      user={{ name: "Budi Santoso", description: "PT Contoh Tambang · Admin Site" }}
      appVersion="1.4.0"
      userMenu={[
        { label: "Profil", href: "/profile", icon: <UserCog className="size-4" /> },
        { label: "Ubah Password", onSelect: () => {}, icon: <KeyRound className="size-4" /> },
      ]}
      onLogout={() => {}}
      {...props}
    >
      <div className="p-4 md:p-6">
        <PageHeader title={TITLES[pathname] ?? pathname} subtitle={`Rute: ${pathname}`} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className="h-28 rounded-xl border border-border bg-card" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

const meta = {
  title: "Components/AppShell",
  component: AppShell,
  parameters: {
    docs: {
      importPath: 'import { AppShell, filterAppShellMenu, type AppShellEntry } from "@mono/ui";',
      story: { inline: false, iframeHeight: 640 },
    },
  },
  args: { menu: MENU, pathname: "/dashboard", brand: null, children: null },
  argTypes: {
    menu: { control: false },
    linkComponent: { control: false },
    brand: { control: false },
    brandMark: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="-m-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Wide sidebar with the user footer. Click the menu to move around; collapse it with
 * the chevron (or ⌘/Ctrl+B) to get the icon rail.
 *
 * In a Next.js app: `pathname={usePathname()}`, `linkComponent={Link}`, and
 * `defaultOpen` from the `sidebar_state` cookie.
 */
export const Default: Story = {
  render: () => <Shell initialPath="/dashboard" />,
};

/** On a group's route, desktop shows the icon rail plus a panel listing the group's pages. */
export const NestedGroup: Story = {
  render: () => <Shell initialPath="/unit/contractor-mapping" />,
};

/** Collapsed to the icon rail; labels show as tooltips. */
export const Collapsed: Story = {
  render: () => <Shell initialPath="/fuel" defaultOpen={false} />,
};

/** Skeleton footer while the session resolves; a progress bar while a route loads. */
export const Loading: Story = {
  render: () => <Shell initialPath="/dashboard" user={undefined} userLoading navigating />,
};

/** Phone: top bar opens the sidebar sheet; the liquid-glass tab bar shows on the tab roots. */
export const Mobile: Story = {
  ...mobileStory,
  render: () => <Shell initialPath="/dashboard" bottomNav={BOTTOM_NAV} />,
};
