"use client";

import { RoleLayoutFrame } from "@/components/RoleLayoutFrame";
import { InventoryClerkSidebar } from "@/components/sidebars/inventory_clerk_sidebar";

export default function InventoryClerkLayout({
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
        "inventory_clerk",
      ]}
      basePath="/inventory_clerk"
      defaultRedirect="/inventory_clerk/dashboard"
      headerTitle="Inventory Clerk Workspace"
      SidebarComponent={InventoryClerkSidebar}
    >
      {children}
    </RoleLayoutFrame>
  );
}
