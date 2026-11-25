"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import { getOutlets, getUsers } from "@/lib/api";
import type { Outlet, User } from "@/lib/types";
import { AdminDashboardView } from "./admin_dashboard";

export function SuperAdminDashboardView() {
  const { showToast } = useToast();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<number>(1);

  useEffect(() => {
    Promise.all([getOutlets(), getUsers()])
      .then(([outRes, usrRes]) => {
        setOutlets(outRes.data);
        setUsers(usrRes.data);
        if (outRes.data[0]) {
          setSelectedOutletId(outRes.data[0].id);
        }
      })
      .catch((err) => {
        showToast(
          err instanceof Error
            ? err.message
            : "Failed to load platform summary.",
          "error"
        );
      });
  }, [showToast]);

  return (
    <div className="flex flex-col gap-8">
      {/* Platform Header & Outlet Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              Platform Super Admin
            </h1>
            <StatusBadge label={`${outlets.length} Outlets`} tone="info" />
            <StatusBadge label={`${users.length} Staff`} tone="success" />
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Multi-outlet oversight, staff RBAC, and store analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedOutletId}
            onChange={(e) => setSelectedOutletId(Number(e.target.value))}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            {outlets.length === 0 ? (
              <option value={1}>Outlet #1</option>
            ) : (
              outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.code})
                </option>
              ))
            )}
          </select>

          <Link
            href="/super_admin/outlets"
            className="rounded-xl border border-zinc-300 px-3.5 py-2 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Manage Outlets
          </Link>
          <Link
            href="/super_admin/users"
            className="rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Manage Users & Roles
          </Link>
        </div>
      </div>

      {/* Selected Outlet Analytics */}
      <AdminDashboardView outletIdOverride={selectedOutletId} />
    </div>
  );
}
