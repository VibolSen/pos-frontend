"use client";

import { FormEvent, useState } from "react";
import { closeShift, openShift, recordCashMovement } from "@/lib/api";
import type { ActiveShiftData } from "@/lib/types";
import { Modal } from "../Modal";
import { useToast } from "../ToastProvider";

export function ShiftModal({
  open,
  onClose,
  activeShift,
  outletId,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  activeShift: ActiveShiftData | null;
  outletId: number;
  onUpdated: () => void;
}) {
  const { showToast } = useToast();
  const [openingFloat, setOpeningFloat] = useState("100");
  const [movementType, setMovementType] = useState<"in" | "out">("in");
  const [movementAmount, setMovementAmount] = useState("");
  const [movementReason, setMovementReason] = useState("");
  const [countedCash, setCountedCash] = useState("");
  const [closingNote, setClosingNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleOpenShift(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await openShift({
        opening_float: Number(openingFloat) || 0,
        outlet_id: outletId,
        register_id: 1,
      });
      showToast("Shift opened successfully.", "success");
      onUpdated();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to open shift.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCashMovement(e: FormEvent) {
    e.preventDefault();
    if (!activeShift) return;
    setSubmitting(true);
    try {
      await recordCashMovement(activeShift.shift.id, {
        type: movementType,
        amount: Number(movementAmount),
        reason: movementReason,
      });
      showToast("Cash drawer movement recorded.", "success");
      setMovementAmount("");
      setMovementReason("");
      onUpdated();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to record cash movement.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloseShift(e: FormEvent) {
    e.preventDefault();
    if (!activeShift) return;
    setSubmitting(true);
    try {
      const res = await closeShift(activeShift.shift.id, {
        counted_cash: Number(countedCash) || 0,
        closing_note: closingNote || undefined,
      });
      showToast(
        `Shift closed. Variance: $${Number(res.data.cash_variance).toFixed(2)}`,
        "success"
      );
      setCountedCash("");
      setClosingNote("");
      onUpdated();
      onClose();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to close shift.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={activeShift ? `Active Shift #${activeShift.shift.id}` : "Open Shift"}
      subtitle={
        activeShift
          ? "Record cash drawer movements or close your shift."
          : "Enter your starting cash drawer float to begin selling."
      }
      maxWidthClass="max-w-xl"
    >
      {!activeShift ? (
        <form onSubmit={handleOpenShift} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Opening Float (USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3.5 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {submitting ? "Opening..." : "Open Shift"}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div>
              <p className="text-xs text-zinc-500">Opening Float</p>
              <p className="font-mono font-semibold">
                ${activeShift.summary.opening_float.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Cash Sales</p>
              <p className="font-mono font-semibold">
                ${activeShift.summary.cash_sales.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Expected Cash</p>
              <p className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                ${activeShift.summary.expected_cash.toFixed(2)}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleCashMovement}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <h3 className="text-sm font-semibold">Cash Drawer In / Out</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <select
                value={movementType}
                onChange={(e) =>
                  setMovementType(e.target.value as "in" | "out")
                }
                className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="in">Cash In</option>
                <option value="out">Cash Out</option>
              </select>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="Amount"
                value={movementAmount}
                onChange={(e) => setMovementAmount(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
              <input
                type="text"
                required
                placeholder="Reason"
                value={movementReason}
                onChange={(e) => setMovementReason(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl border border-zinc-300 px-3.5 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Record Movement
              </button>
            </div>
          </form>

          <form
            onSubmit={handleCloseShift}
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/40 p-4 dark:border-red-900/50 dark:bg-red-950/20"
          >
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-300">
              Close Shift
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Counted Cash (USD)"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
              <input
                type="text"
                placeholder="Closing note (optional)"
                value={closingNote}
                onChange={(e) => setClosingNote(e.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                Close Shift & Calculate Variance
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
