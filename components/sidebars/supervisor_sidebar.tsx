"use client";

import { SidebarFrame, type SidebarNavGroup } from "./admin_sidebar";

export const SUPERVISOR_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: "Store Floor",
    items: [
      { href: "/supervisor/dashboard", label: "Floor Overview", roles: ["supervisor"] },
      { href: "/pos", label: "POS Terminal", roles: ["supervisor"] },
    ],
  },
];

export function SupervisorSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <SidebarFrame
      brandLabel="Supervisor"
      brandHref="/supervisor/dashboard"
      groups={SUPERVISOR_NAV_GROUPS}
      mobileOpen={mobileOpen}
      onCloseMobile={onCloseMobile}
    />
  );
}
