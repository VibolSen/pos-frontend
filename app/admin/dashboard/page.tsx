"use client";

import { useAuth } from "@/components/AuthProvider";
import { AccountantDashboardView } from "@/components/dashboards/accountant_dashboard";
import { AdminDashboardView } from "@/components/dashboards/admin_dashboard";
import { CashierDashboardView } from "@/components/dashboards/cashier_dashboard";
import { InventoryClerkDashboardView } from "@/components/dashboards/inventory_clerk_dashboard";
import { OutletManagerDashboardView } from "@/components/dashboards/outlet_manager_dashboard";
import { SuperAdminDashboardView } from "@/components/dashboards/super_admindash_board";
import { SupervisorDashboardView } from "@/components/dashboards/supervisor_dashboard";
import type { UserRole } from "@/lib/types";

const ROLE_DASHBOARDS: Record<UserRole, React.ComponentType> = {
  super_admin: SuperAdminDashboardView,
  admin: AdminDashboardView,
  outlet_manager: OutletManagerDashboardView,
  inventory_clerk: InventoryClerkDashboardView,
  accountant: AccountantDashboardView,
  supervisor: SupervisorDashboardView,
  cashier: CashierDashboardView,
  customer: CashierDashboardView,
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const DashboardView =
    (user?.role && ROLE_DASHBOARDS[user.role]) || AdminDashboardView;
  return <DashboardView />;
}
