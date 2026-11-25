"use client";

import { RoleLayoutFrame } from "@/components/RoleLayoutFrame";
import { SupervisorSidebar } from "@/components/sidebars/supervisor_sidebar";

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleLayoutFrame
      allowedRoles={["super_admin", "admin", "outlet_manager", "supervisor"]}
      basePath="/supervisor"
      defaultRedirect="/supervisor/dashboard"
      headerTitle="Supervisor Workspace"
      SidebarComponent={SupervisorSidebar}
    >
      {children}
    </RoleLayoutFrame>
  );
}
