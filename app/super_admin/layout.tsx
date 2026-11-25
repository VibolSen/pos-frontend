"use client";

import { RoleLayoutFrame } from "@/components/RoleLayoutFrame";
import { SuperAdminSidebar } from "@/components/sidebars/super_admin_sidebar";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayoutFrame
      allowedRoles={["super_admin"]}
      basePath="/super_admin"
      defaultRedirect="/super_admin/dashboards"
      headerTitle="Super Admin Control Center"
      SidebarComponent={SuperAdminSidebar}
    >
      {children}
    </RoleLayoutFrame>
  );
}
