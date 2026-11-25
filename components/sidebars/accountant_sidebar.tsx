"use client";

import { SidebarFrame, type SidebarNavGroup } from "./admin_sidebar";

export const ACCOUNTANT_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: "Finance & Reports",
    items: [
      { href: "/accountant/dashboard", label: "Financial Dashboard", roles: ["accountant"] },
    ],
  },
];

export function AccountantSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <SidebarFrame
      brandLabel="Accountant"
      brandHref="/accountant/dashboard"
      groups={ACCOUNTANT_NAV_GROUPS}
      mobileOpen={mobileOpen}
      onCloseMobile={onCloseMobile}
    />
  );
}
