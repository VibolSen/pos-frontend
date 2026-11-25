"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Footer } from "./nav/footer";
import { Header } from "./nav/header";
import type { UserRole } from "@/lib/types";

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/super_admin/dashboards";
    case "admin":
      return "/admin/dashboard";
    case "outlet_manager":
      return "/outlet_manager/dashboard";
    case "inventory_clerk":
      return "/inventory_clerk/dashboard";
    case "accountant":
      return "/accountant/dashboard";
    case "supervisor":
      return "/supervisor/dashboard";
    case "cashier":
    default:
      return "/pos";
  }
}

export function RoleLayoutFrame({
  allowedRoles,
  basePath,
  defaultRedirect,
  headerTitle,
  SidebarComponent,
  children,
}: {
  allowedRoles: UserRole[];
  basePath: string;
  defaultRedirect: string;
  headerTitle: string;
  SidebarComponent: React.ComponentType<{
    mobileOpen: boolean;
    onCloseMobile: () => void;
  }>;
  children: React.ReactNode;
}) {
  const { user, loading, hasRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!hasRole(allowedRoles)) {
      router.replace(getDefaultRouteForRole(user.role));
      return;
    }
    if (pathname === basePath) {
      router.replace(defaultRedirect);
    }
  }, [
    user,
    loading,
    hasRole,
    allowedRoles,
    pathname,
    basePath,
    defaultRedirect,
    router,
  ]);

  if (loading || !user || !hasRole(allowedRoles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
        Loading workspace...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <SidebarComponent
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={headerTitle}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
