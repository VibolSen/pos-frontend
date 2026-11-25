"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Footer } from "./nav/footer";
import { Header } from "./nav/header";
import { AccountantSidebar } from "./sidebars/accountant_sidebar";
import { AdminSidebar } from "./sidebars/admin_sidebar";
import { CashierSidebar } from "./sidebars/cashier_sidebar";
import { InventoryClerkSidebar } from "./sidebars/inventory_clerk_sidebar";
import { OutletManagerSidebar } from "./sidebars/outlet_manager_sidebar";
import { SuperAdminSidebar } from "./sidebars/super_admin_sidebar";
import { SupervisorSidebar } from "./sidebars/supervisor_sidebar";
import type { UserRole } from "@/lib/types";

const ROLE_SIDEBARS: Record<
  UserRole,
  React.ComponentType<{ mobileOpen: boolean; onCloseMobile: () => void }>
> = {
  super_admin: SuperAdminSidebar,
  admin: AdminSidebar,
  outlet_manager: OutletManagerSidebar,
  inventory_clerk: InventoryClerkSidebar,
  accountant: AccountantSidebar,
  supervisor: SupervisorSidebar,
  cashier: CashierSidebar,
  customer: CashierSidebar,
};

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const Sidebar = (user?.role && ROLE_SIDEBARS[user.role]) || AdminSidebar;

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title="Back-Office Management"
          onOpenMobileMenu={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
