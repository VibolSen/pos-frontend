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
import { formatMoney } from "./admin_dashboard";

export function AccountantDashboardView() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const outletId = user?.outlet_id ?? 1;

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
      .then(([s, w, c]) => {
        if (!active) return;
        setSummary(s.data);
        setWidgets(w.data);
        setCharts(c.data);
      })
      .catch((err) => {
        if (!active) return;
        showToast(
          err instanceof Error
            ? err.message
            : "Failed to load financial dashboard.",
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
        Loading financial overview...
      </div>
    );
  }

  const m = summary?.metrics;
  const financeCards = [
    { label: "Total Sales", value: formatMoney(m?.total_sales), change: m?.total_sales_change },
    { label: "Net Profit", value: formatMoney(m?.profit), change: m?.profit_change },
    { label: "Total Expenses", value: formatMoney(m?.total_expenses), change: m?.total_expenses_change },
    { label: "Invoice Due", value: formatMoney(m?.invoice_due), change: m?.invoice_due_change },
    { label: "Sales Returns", value: formatMoney(m?.total_sales_return), change: m?.total_sales_return_change },
    { label: "Total Purchases", value: formatMoney(m?.total_purchase), change: m?.total_purchase_change },
    { label: "Purchase Returns", value: formatMoney(m?.total_purchase_return), change: m?.total_purchase_return_change },
    { label: "Payment Returns", value: formatMoney(m?.total_payment_returns), change: m?.total_payment_returns_change },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Financial Dashboard
        </h1>
        <p className="text-sm text-zinc-500">
          Revenue, expenses, returns, and invoice reconciliation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {financeCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs font-medium text-zinc-500">{card.label}</p>
            <p className="mt-2 font-mono text-2xl font-bold">{card.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{card.change ?? ""}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-base font-semibold">
          Monthly Revenue vs Expense
        </h2>
        <div className="grid grid-cols-12 gap-2 text-center text-xs">
          {charts?.sales_statics.map((row) => (
            <div
              key={row.month}
              className="rounded-xl border border-zinc-200 p-2 dark:border-zinc-800"
            >
              <p className="font-semibold">{row.month}</p>
              <p className="mt-1 font-mono text-emerald-600 dark:text-emerald-400">
                +{row.revenue}
              </p>
              <p className="font-mono text-red-500">{row.expense}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-base font-semibold">Recent Sales Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
              <tr>
                <th className="py-2 pr-4">Receipt</th>
                <th className="py-2 pr-4">Customer / Staff</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 text-right">Amount</th>
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
  );
}
