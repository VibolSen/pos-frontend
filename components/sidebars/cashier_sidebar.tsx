"use client";

import { SidebarFrame, type SidebarNavGroup } from "./admin_sidebar";

export const CASHIER_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: "Register",
    items: [
      { href: "/cashier/dashboard", label: "Register Overview", roles: ["cashier"] },
      { href: "/pos", label: "POS Terminal", roles: ["cashier"] },
    ],
  },
];

export function CashierSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <SidebarFrame
      brandLabel="Cashier"
      brandHref="/cashier/dashboard"
      groups={CASHIER_NAV_GROUPS}
      mobileOpen={mobileOpen}
      onCloseMobile={onCloseMobile}
    />
  );
}
