"use client";

import { RoleLayoutFrame } from "@/components/RoleLayoutFrame";
import { CashierSidebar } from "@/components/sidebars/cashier_sidebar";

export default function CashierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayoutFrame
      allowedRoles={[
        "super_admin",
        "admin",
        "outlet_manager",
        "supervisor",
        "cashier",
      ]}
      basePath="/cashier"
      defaultRedirect="/cashier/dashboard"
      headerTitle="Cashier Workspace"
      SidebarComponent={CashierSidebar}
    >
      {children}
    </RoleLayoutFrame>
  );
}
