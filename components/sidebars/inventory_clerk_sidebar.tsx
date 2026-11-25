"use client";

import { SidebarFrame, type SidebarNavGroup } from "./admin_sidebar";

export const INVENTORY_CLERK_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/inventory_clerk/dashboard", label: "Inventory Dashboard", roles: ["inventory_clerk"] },
    ],
  },
  {
    title: "Catalog & Stock",
    items: [
      { href: "/inventory_clerk/inventory", label: "Inventory", roles: ["inventory_clerk"] },
      { href: "/inventory_clerk/products", label: "Products", roles: ["inventory_clerk"] },
      { href: "/inventory_clerk/categories", label: "Categories", roles: ["inventory_clerk"] },
      { href: "/inventory_clerk/brands", label: "Brands", roles: ["inventory_clerk"] },
    ],
  },
];

export function InventoryClerkSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <SidebarFrame
      brandLabel="Inventory Clerk"
      brandHref="/inventory_clerk/dashboard"
      groups={INVENTORY_CLERK_NAV_GROUPS}
      mobileOpen={mobileOpen}
      onCloseMobile={onCloseMobile}
    />
  );
}
