import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import {
  Building2,
  ChevronsUpDown,
  Fuel,
  Gauge,
  HardHat,
  LayoutDashboard,
  MapPin,
  MoreHorizontal,
  Plus,
  Settings,
  Truck,
} from "lucide-react";
import { type ComponentProps, useEffect, useState } from "react";

import { mobileStory } from "../../.storybook/docs/mobile";
import { PageHeader } from "../page-header/page-header.js";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar.js";

const OPERATIONS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "fuel", label: "Fuel", icon: Fuel, badge: "12" },
  { key: "boundary", label: "Boundary", icon: MapPin, badge: "3" },
  { key: "unit", label: "Unit", icon: Truck },
  { key: "produksi", label: "Produksi", icon: Gauge },
];

const SITES = ["Site Bontang", "Site Sangatta", "Site Kideco"];

/** Wraps each story in `SidebarProvider`; `parameters.sidebar.defaultOpen` sets its start state. */
const withSidebarProvider: Decorator = (Story, context) => (
  <SidebarProvider defaultOpen={context.parameters.sidebar?.defaultOpen ?? true}>
    <Story />
  </SidebarProvider>
);

/** The app shell's nav: brand, search, menu groups with badges and a sub-menu, user footer. */
function AppSidebar({
  loading = false,
  ...props
}: ComponentProps<typeof Sidebar> & { loading?: boolean }) {
  const [active, setActive] = useState("fuel");

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                MN
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">MoNo</span>
                <span className="truncate text-xs text-sidebar-foreground/60">Site Bontang</span>
              </span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarInput placeholder="Cari menu" aria-label="Cari menu" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operasional</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuItem>
                  ))
                : OPERATIONS.map((item) => (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={active === item.key}
                        tooltip={item.label}
                        onClick={() => setActive(item.key)}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                    </SidebarMenuItem>
                  ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Master data</SidebarGroupLabel>
          <SidebarGroupAction title="Tambah site">
            <Plus />
            <span className="sr-only">Tambah site</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Site">
                  <Building2 />
                  <span>Site</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {SITES.map((site) => (
                    <SidebarMenuSubItem key={site}>
                      <SidebarMenuSubButton href={`#${site}`} isActive={site === "Site Bontang"}>
                        <span>{site}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Kontraktor">
                  <HardHat />
                  <span>Kontraktor</span>
                </SidebarMenuButton>
                <SidebarMenuAction showOnHover aria-label="Opsi kontraktor">
                  <MoreHorizontal />
                </SidebarMenuAction>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Pengaturan">
              <Settings />
              <span>Pengaturan</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
                RA
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-medium">Rina Andriani</span>
                <span className="truncate text-xs text-sidebar-foreground/60">Admin site</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** Page content beside the sidebar, with the `SidebarTrigger` as the header's leading control. */
function Page() {
  const { state, isMobile } = useSidebar();
  return (
    <SidebarInset className="gap-4 p-4">
      <PageHeader
        title="Fuel"
        subtitle={isMobile ? "Ringkasan harian" : `Sidebar: ${state}`}
        leading={<SidebarTrigger />}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {["12.480 L hari ini", "86 unit aktif", "3 unit keluar boundary"].map((text) => (
          <div key={text} className="rounded-xl border border-foreground/10 p-4 text-sm">
            {text}
          </div>
        ))}
      </div>
    </SidebarInset>
  );
}

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  decorators: [withSidebarProvider],
  parameters: {
    docs: {
      importPath: `import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@mono/ui";`,
      // The sidebar is position: fixed to the viewport, so each example gets its own frame.
      story: { inline: false, iframeHeight: 560 },
    },
  },
  args: { variant: "sidebar", collapsible: "offcanvas", side: "left" },
  argTypes: {
    variant: { control: "inline-radio", options: ["sidebar", "floating", "inset"] },
    collapsible: { control: "inline-radio", options: ["offcanvas", "icon", "none"] },
    side: { control: "inline-radio", options: ["left", "right"] },
  },
  render: (args) => (
    <>
      <AppSidebar {...args} />
      <Page />
    </>
  ),
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Full app shell. Toggle with the header button, the rail on the sidebar's edge, or Cmd/Ctrl+B. */
export const Default: Story = {};

/** `collapsible="icon"` shrinks to an icon strip; menu buttons show their `tooltip` on hover. */
export const CollapsedToIcons: Story = {
  args: { collapsible: "icon" },
  parameters: { sidebar: { defaultOpen: false } },
};

/** `variant="floating"` draws the sidebar as a rounded card. */
export const Floating: Story = {
  args: { variant: "floating" },
};

/** `variant="inset"` puts the page content in a rounded card next to the sidebar. */
export const Inset: Story = {
  args: { variant: "inset" },
};

/** While the menu loads, `SidebarMenuSkeleton` keeps the shape of the entries. */
export const Loading: Story = {
  render: (args) => (
    <>
      <AppSidebar {...args} loading />
      <Page />
    </>
  ),
};

/** Opens the mobile sheet on mount, the way `SidebarTrigger` would. */
function OpenOnMount() {
  const { setOpenMobile } = useSidebar();
  useEffect(() => {
    setOpenMobile(true);
  }, [setOpenMobile]);
  return null;
}

/** Below `md` the sidebar becomes a slide-in sheet opened by `SidebarTrigger` (shown open here). */
export const Mobile: Story = {
  ...mobileStory,
  render: (args) => (
    <>
      <AppSidebar {...args} />
      <Page />
      <OpenOnMount />
    </>
  ),
};
