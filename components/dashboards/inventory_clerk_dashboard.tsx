"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import {
  getExpiredInventory,
  getInventoryBalances,
  getInventoryMovements,
} from "@/lib/api";
import type {
  ExpiredProduct,
  InventoryBalance,
  InventoryMovement,
} from "@/lib/types";

export function InventoryClerkDashboardView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const outletId = user?.outlet_id ?? 1;

  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [expired, setExpired] = useState<ExpiredProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getInventoryBalances({ outlet_id: outletId }),
      getInventoryMovements({ outlet_id: outletId }),
      getExpiredInventory({ outlet_id: outletId }),
    ])
      .then(([b, m, e]) => {
        if (!active) return;
        setBalances(b.data);
        setMovements(m.data);
        setExpired(e.data);
      })
      .catch((err) => {
        if (!active) return;
        showToast(
          err instanceof Error
            ? err.message
            : "Failed to load inventory overview.",
          "error"
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [outletId, showToast]);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-zinc-500">
        Loading inventory overview...
      </div>
    );
  }

  const lowStock = balances.filter((b) => b.is_low_stock);
  const outOfStock = balances.filter((b) => Number(b.on_hand) <= 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Inventory Workspace
          </h1>
          <p className="text-sm text-zinc-500">
            Outlet #{outletId} stock levels, expiry alerts, and recent
            movements
          </p>
        </div>
        <Link
          href="/admin/inventory"
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Open Inventory Manager
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Tracked SKUs</p>
          <p className="mt-2 font-mono text-2xl font-bold">{balances.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Low Stock</p>
          <p className="mt-2 font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">
            {lowStock.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Out of Stock</p>
          <p className="mt-2 font-mono text-2xl font-bold text-red-600 dark:text-red-400">
            {outOfStock.length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500">Expiring / Expired</p>
          <p className="mt-2 font-mono text-2xl font-bold">{expired.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Low Stock Items</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-zinc-500">All items are well stocked.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              {lowStock.slice(0, 8).map((item) => (
                <li
                  key={item.balance_id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="font-mono text-xs text-zinc-500">
                      {item.sku}
                    </p>
                  </div>
                  <StatusBadge
                    label={`${Number(item.on_hand)} on hand`}
                    tone={Number(item.on_hand) <= 0 ? "danger" : "warning"}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Recent Movements</h2>
          {movements.length === 0 ? (
            <p className="text-sm text-zinc-500">No recent movements.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              {movements.slice(0, 8).map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="font-medium">{m.product_name}</p>
                    <p className="text-xs text-zinc-500">
                      {m.movement_type} · {m.user_name ?? "System"}
                    </p>
                  </div>
                  <span
                    className={`font-mono font-semibold ${
                      Number(m.quantity) < 0
                        ? "text-red-500"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {Number(m.quantity) > 0
                      ? `+${Number(m.quantity)}`
                      : Number(m.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
