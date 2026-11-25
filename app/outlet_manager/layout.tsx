"use client";

import { RoleLayoutFrame } from "@/components/RoleLayoutFrame";
import { OutletManagerSidebar } from "@/components/sidebars/outlet_manager_sidebar";

export default function OutletManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayoutFrame
      allowedRoles={["super_admin", "admin", "outlet_manager"]}
      basePath="/outlet_manager"
      defaultRedirect="/outlet_manager/dashboard"
      headerTitle="Outlet Manager Workspace"
      SidebarComponent={OutletManagerSidebar}
    >
      {children}
    </RoleLayoutFrame>
  );
}
