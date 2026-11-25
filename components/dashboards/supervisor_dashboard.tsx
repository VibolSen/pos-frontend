"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { getActiveShift, getHeldCarts } from "@/lib/api";
import type { ActiveShiftData, HeldCart } from "@/lib/types";

export function ShiftSummaryDashboard({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const { user } = useAuth();
  const outletId = user?.outlet_id ?? 1;
  const [shift, setShift] = useState<ActiveShiftData | null>(null);
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getActiveShift(), getHeldCarts(outletId)])
      .then(([s, h]) => {
        if (!active) return;
        setShift(s.data);
        setHeldCarts(h.data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [outletId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        Loading register summary...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        <Link
          href="/pos"
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
        >
          Open POS Terminal
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Shift Status</p>
          <div className="mt-2">
            <StatusBadge
              label={shift ? `Open (#${shift.shift.id})` : "No Active Shift"}
              tone={shift ? "success" : "warning"}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Expected Drawer Cash</p>
          <p className="mt-2 font-mono text-2xl font-bold">
            ${(shift?.summary.expected_cash ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Held Carts</p>
          <p className="mt-2 font-mono text-2xl font-bold">
            {heldCarts.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SupervisorDashboardView() {
  return (
    <ShiftSummaryDashboard
      title="Supervisor Floor Overview"
      subtitle="Monitor active shift drawer, held orders, and authorize POS overrides"
    />
  );
}
