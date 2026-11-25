"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import {
  getDashboardCharts,
  getDashboardSummary,
  getDashboardWidgets,
} from "@/lib/api";
import type {
  DashboardCharts,
  DashboardSummary,
  DashboardWidgets,
} from "@/lib/types";

export function formatMoney(value: number | string | undefined) {
  const num = Number(value ?? 0);
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AdminDashboardView({ outletIdOverride }: { outletIdOverride?: number }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const outletId = outletIdOverride ?? user?.outlet_id ?? 1;

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidgets | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      getDashboardSummary(outletId),
      getDashboardWidgets(outletId),
      getDashboardCharts(),
    ])
      .then(([sumRes, widRes, chRes]) => {
        if (!active) return;
        setSummary(sumRes.data);
        setWidgets(widRes.data);
        setCharts(chRes.data);
      })
      .catch((err) => {
        if (!active) return;
        showToast(
          err instanceof Error ? err.message : "Failed to load dashboard.",
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
        Loading dashboard analytics...
      </div>
    );
  }

  const metrics = summary?.metrics;
  const counts = summary?.counts;

  const kpiCards = [
    {
      label: "Total Sales",
      value: formatMoney(metrics?.total_sales),
      change: metrics?.total_sales_change ?? "",
    },
    {
      label: "Profit",
      value: formatMoney(metrics?.profit),
      change: metrics?.profit_change ?? "",
    },
    {
      label: "Total Purchase",
      value: formatMoney(metrics?.total_purchase),
      change: metrics?.total_purchase_change ?? "",
    },
    {
      label: "Sales Return",
      value: formatMoney(metrics?.total_sales_return),
      change: metrics?.total_sales_return_change ?? "",
    },
    {
      label: "Orders",
      value: String(counts?.orders ?? 0),
      change: "Completed",
    },
    {
      label: "Low Stock Items",
      value: String(counts?.low_stock ?? 0),
      change: "Needs reorder",
    },
    {
      label: "Customers",
      value: String(counts?.customers ?? 0),
      change: "Registered",
    },
    {
      label: "Suppliers",
      value: String(counts?.suppliers ?? 0),
      change: "Active",
    },
  ];

  const maxChartVal = Math.max(
    1,
    ...(charts?.sales_purchases.flatMap((d) => [d.sales, d.purchases]) ?? [1])
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Outlet #{outletId} sales, inventory, and financial overview
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-medium text-zinc-500">{card.label}</p>
            <p className="mt-2 font-mono text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Sales vs Purchases Chart & Top Categories */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              Monthly Sales vs Purchases
            </h2>
            <div className="flex gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                Sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-zinc-400" />
                Purchases
              </span>
            </div>
          </div>
          <div className="grid grid-cols-12 items-end gap-2 pt-4">
            {charts?.sales_purchases.map((item) => (
              <div
                key={item.month}
                className="flex flex-col items-center gap-1.5"
              >
                <div className="flex h-36 w-full items-end justify-center gap-1">
                  <div
                    className="w-2.5 rounded-t bg-emerald-500"
                    style={{
                      height: `${Math.max(8, (item.sales / maxChartVal) * 100)}%`,
                    }}
                    title={`Sales: ${item.sales}`}
                  />
                  <div
                    className="w-2.5 rounded-t bg-zinc-300 dark:bg-zinc-700"
                    style={{
                      height: `${Math.max(8, (item.purchases / maxChartVal) * 100)}%`,
                    }}
                    title={`Purchases: ${item.purchases}`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Top Categories</h2>
          <div className="space-y-4">
            {charts?.top_categories.map((cat) => (
              <div key={cat.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{cat.name}</span>
                  <span className="font-mono text-zinc-500">
                    {cat.percentage}% ({cat.sales})
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Top Selling Products</h2>
          <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            {widgets?.top_selling.map((item) => (
              <li
                key={`${item.id}-${item.name}`}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-zinc-500">
                    Sold: {Number(item.sales_count)}
                  </p>
                </div>
                <span className="font-mono font-semibold">
                  {formatMoney(item.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Low Stock Alerts</h2>
          <ul className="divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            {widgets?.low_stock.map((item) => (
              <li
                key={`${item.id}-${item.sku}`}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="font-mono text-xs text-zinc-500">{item.sku}</p>
                </div>
                <StatusBadge
                  label={`${Number(item.in_stock)} left`}
                  tone={Number(item.in_stock) <= 10 ? "danger" : "warning"}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Recent Sales</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
                <tr>
                  <th className="py-2 pr-4">Receipt / ID</th>
                  <th className="py-2 pr-4">Cashier / Customer</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {widgets?.recent_sales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="py-2.5 pr-4 font-mono text-xs">
                      {sale.receipt_number ?? `#${sale.id}`}
                    </td>
                    <td className="py-2.5 pr-4">{sale.customer}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge
                        label={sale.status}
                        tone={
                          sale.status.toLowerCase() === "completed"
                            ? "success"
                            : "warning"
                        }
                      />
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium">
                      {formatMoney(sale.grand_total ?? sale.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
