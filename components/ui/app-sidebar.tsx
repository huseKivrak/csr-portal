'use client';

import type * as React from "react";
import {
  Bot,
  GalleryVerticalEnd,
  Users,
  LayoutDashboard,
  CircleDollarSign
} from "lucide-react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      items: [],
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
      items: []

    },
    {
      title: "Subscriptions",
      url: "/subscriptions",
      icon: Bot,
      items: [
        {
          title: "Active Subscriptions",
          url: "/subscriptions/active",
        },
        {
          title: "Overdue Subscriptions",
          url: "/subscriptions/overdue",
        },
        {
          title: "Subscription Transfers",
          url: "/subscriptions/transfers",
        },
      ],
    },
    {
      title: "Payments",
      url: "/payments",
      icon: CircleDollarSign,
      items: []
    },
  ],
};

// Create NavMain component inline
function NavMain({ items }: { items: typeof data.navMain; }) {
  const pathname = usePathname();
  //TODO: active route

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <Link href={item.url}>
                  {item.icon && <item.icon className="size-4" />}
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function SidebarBrand() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="font-semibold">CSR Portal</span>
              <span className="text-xs text-muted-foreground">AMP Platform</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>

      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

