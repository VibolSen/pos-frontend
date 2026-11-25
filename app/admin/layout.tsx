"use client";

import { RoleLayoutFrame } from "@/components/RoleLayoutFrame";
import { AdminSidebar } from "@/components/sidebars/admin_sidebar";
import { SuperAdminSidebar } from "@/components/sidebars/super_admin_sidebar";
import { useAuth } from "@/components/AuthProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const Sidebar =
    user?.role === "super_admin" ? SuperAdminSidebar : AdminSidebar;

  return (
    <RoleLayoutFrame
      allowedRoles={["super_admin", "admin"]}
      basePath="/admin"
      defaultRedirect="/admin/dashboard"
      headerTitle="Admin Back-Office"
      SidebarComponent={Sidebar}
    >
      {children}
    </RoleLayoutFrame>
  );
}
