"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import {
  adjustInventory,
  getExpiredInventory,
  getInventoryBalances,
  getInventoryMovements,
  getProducts,
  receiveInventory,
} from "@/lib/api";
import type {
  ExpiredProduct,
  InventoryBalance,
  InventoryMovement,
  Product,
} from "@/lib/types";

export default function AdminInventoryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const outletId = user?.outlet_id ?? 1;

  const [tab, setTab] = useState<"balances" | "movements" | "expired">(
    "balances"
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [expired, setExpired] = useState<ExpiredProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [poNumber, setPoNumber] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [receiveProductId, setReceiveProductId] = useState("");
  const [receiveQty, setReceiveQty] = useState("10");
  const [receiveCost, setReceiveCost] = useState("");

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustType, setAdjustType] = useState<"increment" | "decrement">(
    "decrement"
  );
  const [adjustQty, setAdjustQty] = useState("1");
  const [adjustReason, setAdjustReason] = useState<
    "spoilage" | "damaged" | "count_variance" | "found" | "other"
  >("count_variance");
  const [adjustNotes, setAdjustNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [balRes, movRes, expRes, prodRes] = await Promise.all([
        getInventoryBalances({
          outlet_id: outletId,
          status: tab === "balances" ? statusFilter || undefined : undefined,
          q: search || undefined,
        }),
        getInventoryMovements({
          outlet_id: outletId,
          q: search || undefined,
        }),
        getExpiredInventory({
          outlet_id: outletId,
          status: tab === "expired" ? statusFilter || undefined : undefined,
          q: search || undefined,
        }),
        getProducts({ outlet_id: outletId }),
      ]);
      setBalances(balRes.data);
      setMovements(movRes.data);
      setExpired(expRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load inventory.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [outletId, tab, statusFilter, search, showToast]);

  useEffect(() => {
    const t = setTimeout(loadData, 150);
    return () => clearTimeout(t);
  }, [loadData]);

  async function handleReceive(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await receiveInventory({
        outlet_id: outletId,
        po_number: poNumber || undefined,
        supplier_name: supplierName || undefined,
        items: [
          {
            product_id: Number(receiveProductId),
            quantity: Number(receiveQty),
            unit_cost: receiveCost ? Number(receiveCost) : undefined,
          },
        ],
      });
      showToast("Stock received and ledger updated.", "success");
      setReceiveOpen(false);
      setPoNumber("");
      setSupplierName("");
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to receive stock.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdjust(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adjustInventory({
        outlet_id: outletId,
        product_id: Number(adjustProductId),
        quantity: Number(adjustQty),
        type: adjustType,
        reason: adjustReason,
        notes: adjustNotes || undefined,
      });
      showToast("Stock adjustment recorded.", "success");
      setAdjustOpen(false);
      setAdjustNotes("");
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to adjust stock.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-zinc-500">
            Outlet #{outletId} stock balances, movements ledger, and expiry
            alerts
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setReceiveProductId(products[0] ? String(products[0].id) : "");
              setReceiveOpen(true);
            }}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
          >
            + Receive Stock
          </button>
          <button
            type="button"
            onClick={() => {
              setAdjustProductId(products[0] ? String(products[0].id) : "");
              setAdjustOpen(true);
            }}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            Adjust Stock
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["balances", "movements", "expired"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setStatusFilter("");
              }}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
                tab === t
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {t === "expired" ? "Expiry Alerts" : t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            placeholder="Search SKU or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          {tab === "balances" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">All Stock</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {tab === "balances" && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">On Hand</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : balances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                    No inventory balances found.
                  </td>
                </tr>
              ) : (
                balances.map((b) => (
                  <tr key={b.balance_id}>
                    <td className="px-4 py-3 font-medium">{b.product_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {b.sku}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {b.category_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {Number(b.on_hand)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {Number(b.available)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={
                          Number(b.on_hand) <= 0
                            ? "Out of Stock"
                            : b.is_low_stock
                              ? "Low Stock"
                              : "In Stock"
                        }
                        tone={
                          Number(b.on_hand) <= 0
                            ? "danger"
                            : b.is_low_stock
                              ? "warning"
                              : "success"
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === "movements" && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Qty Change</th>
                <th className="px-4 py-3">By</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No movements recorded.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium">
                      {m.product_name}{" "}
                      <span className="font-mono text-xs text-zinc-400">
                        ({m.sku})
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={m.movement_type} tone="info" />
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-mono font-semibold ${
                        Number(m.quantity) < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {Number(m.quantity) > 0
                        ? `+${Number(m.quantity)}`
                        : Number(m.quantity)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {m.user_name ?? "System"}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {m.notes ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === "expired" && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3 text-right">Days Left</th>
                <th className="px-4 py-3 text-right">On Hand</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {expired.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                    No expired or expiring products.
                  </td>
                </tr>
              ) : (
                expired.map((item) => (
                  <tr key={item.product_id}>
                    <td className="px-4 py-3 font-medium">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.expiry_date}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {item.days_left}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {Number(item.on_hand)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={
                          item.status === "expired"
                            ? "Expired"
                            : "Expiring Soon"
                        }
                        tone={item.status === "expired" ? "danger" : "warning"}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Receive Stock Modal */}
      <Modal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        title="Receive Stock (PO)"
      >
        <form onSubmit={handleReceive} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="PO Number (optional)"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            <input
              placeholder="Supplier (optional)"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <select
            required
            value={receiveProductId}
            onChange={(e) => setReceiveProductId(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min="1"
              required
              placeholder="Quantity"
              value={receiveQty}
              onChange={(e) => setReceiveQty(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Unit Cost (optional)"
              value={receiveCost}
              onChange={(e) => setReceiveCost(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReceiveOpen(false)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? "Receiving..." : "Confirm Receive"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Adjust Stock"
      >
        <form onSubmit={handleAdjust} className="flex flex-col gap-4">
          <select
            required
            value={adjustProductId}
            onChange={(e) => setAdjustProductId(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={adjustType}
              onChange={(e) =>
                setAdjustType(e.target.value as "increment" | "decrement")
              }
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="decrement">Decrement (-)</option>
              <option value="increment">Increment (+)</option>
            </select>
            <input
              type="number"
              min="1"
              required
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <select
            value={adjustReason}
            onChange={(e) =>
              setAdjustReason(
                e.target.value as
                  | "spoilage"
                  | "damaged"
                  | "count_variance"
                  | "found"
                  | "other"
              )
            }
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="count_variance">Count Variance</option>
            <option value="damaged">Damaged</option>
            <option value="spoilage">Spoilage</option>
            <option value="found">Found</option>
            <option value="other">Other</option>
          </select>
          <input
            placeholder="Notes (optional)"
            value={adjustNotes}
            onChange={(e) => setAdjustNotes(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdjustOpen(false)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? "Saving..." : "Save Adjustment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
