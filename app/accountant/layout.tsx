"use client";

import { RoleLayoutFrame } from "@/components/RoleLayoutFrame";
import { AccountantSidebar } from "@/components/sidebars/accountant_sidebar";

export default function AccountantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayoutFrame
      allowedRoles={["super_admin", "admin", "accountant"]}
      basePath="/accountant"
      defaultRedirect="/accountant/dashboard"
      headerTitle="Accountant Workspace"
      SidebarComponent={AccountantSidebar}
    >
      {children}
    </RoleLayoutFrame>
  );
}
