"use client";

import { SidebarFrame, type SidebarNavGroup } from "./admin_sidebar";

export const OUTLET_MANAGER_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/outlet_manager/dashboard", label: "Dashboard", roles: ["outlet_manager"] },
      { href: "/pos", label: "POS Terminal", roles: ["outlet_manager"] },
    ],
  },
  {
    title: "Catalog & Inventory",
    items: [
      { href: "/outlet_manager/products", label: "Products", roles: ["outlet_manager"] },
      { href: "/outlet_manager/categories", label: "Categories", roles: ["outlet_manager"] },
      { href: "/outlet_manager/brands", label: "Brands", roles: ["outlet_manager"] },
      { href: "/outlet_manager/inventory", label: "Inventory", roles: ["outlet_manager"] },
    ],
  },
  {
    title: "Operations & People",
    items: [
      { href: "/outlet_manager/customers", label: "Customers", roles: ["outlet_manager"] },
      { href: "/outlet_manager/suppliers", label: "Suppliers", roles: ["outlet_manager"] },
      { href: "/outlet_manager/outlets", label: "Outlets / Stores", roles: ["outlet_manager"] },
      { href: "/outlet_manager/employees", label: "HRM & Employees", roles: ["outlet_manager"] },
    ],
  },
];

export function OutletManagerSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <SidebarFrame
      brandLabel="Outlet Manager"
      brandHref="/outlet_manager/dashboard"
      groups={OUTLET_MANAGER_NAV_GROUPS}
      mobileOpen={mobileOpen}
      onCloseMobile={onCloseMobile}
    />
  );
}
