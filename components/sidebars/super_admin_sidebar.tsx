"use client";

import { SidebarFrame, type SidebarNavGroup } from "./admin_sidebar";

export const SUPER_ADMIN_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: "Platform Control",
    items: [
      {
        href: "/super_admin/dashboards",
        label: "Super Admin Overview",
        roles: ["super_admin"],
      },
      {
        href: "/pos",
        label: "POS Terminal",
        roles: ["super_admin"],
      },
    ],
  },
  {
    title: "Catalog & Inventory",
    items: [
      {
        href: "/super_admin/products",
        label: "Products",
        roles: ["super_admin"],
      },
      {
        href: "/super_admin/categories",
        label: "Categories",
        roles: ["super_admin"],
      },
      {
        href: "/super_admin/brands",
        label: "Brands",
        roles: ["super_admin"],
      },
      {
        href: "/super_admin/inventory",
        label: "Inventory",
        roles: ["super_admin"],
      },
    ],
  },
  {
    title: "People & Stores",
    items: [
      {
        href: "/super_admin/customers",
        label: "Customers",
        roles: ["super_admin"],
      },
      {
        href: "/super_admin/suppliers",
        label: "Suppliers",
        roles: ["super_admin"],
      },
      {
        href: "/super_admin/outlets",
        label: "Outlets / Stores",
        roles: ["super_admin"],
      },
      {
        href: "/super_admin/employees",
        label: "HRM & Employees",
        roles: ["super_admin"],
      },
    ],
  },
  {
    title: "Access & Security",
    items: [
      {
        href: "/super_admin/users",
        label: "Users & Role Matrix",
        roles: ["super_admin"],
      },
    ],
  },
];

export function SuperAdminSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <SidebarFrame
      brandLabel="POS Super Admin"
      brandHref="/super_admin/dashboards"
      groups={SUPER_ADMIN_NAV_GROUPS}
      mobileOpen={mobileOpen}
      onCloseMobile={onCloseMobile}
    />
  );
}
