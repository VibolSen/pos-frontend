"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { AdminDashboardView } from "./admin_dashboard";

export function OutletManagerDashboardView() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h2 className="text-lg font-semibold">
            Outlet #{user?.outlet_id ?? 1} Operations
          </h2>
          <p className="text-xs text-zinc-500">
            Daily sales, stock alerts, and store team shortcuts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/pos"
            className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
          >
            Open POS
          </Link>
          <Link
            href="/admin/inventory"
            className="rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Manage Inventory
          </Link>
          <Link
            href="/admin/employees"
            className="rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Staff & HRM
          </Link>
        </div>
      </div>

      <AdminDashboardView />
    </div>
  );
}
