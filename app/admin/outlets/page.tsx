"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import {
  createOutlet,
  deleteOutlet,
  getOutlets,
  updateOutlet,
} from "@/lib/api";
import type { Outlet } from "@/lib/types";

export default function AdminOutletsPage() {
  const { showToast } = useToast();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Outlet | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [receiptHeader, setReceiptHeader] = useState("");
  const [receiptFooter, setReceiptFooter] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOutlets(search || undefined);
      setOutlets(res.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load outlets.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    const t = setTimeout(loadData, 150);
    return () => clearTimeout(t);
  }, [loadData]);

  function openCreate() {
    setEditing(null);
    setName("");
    setCode("");
    setPhone("");
    setAddress("");
    setReceiptHeader("Thank you for shopping!");
    setReceiptFooter("Please come again!");
    setModalOpen(true);
  }

  function openEdit(o: Outlet) {
    setEditing(o);
    setName(o.name);
    setCode(o.code);
    setPhone(o.phone ?? "");
    setAddress(o.address ?? "");
    setReceiptHeader(o.receipt_header ?? "");
    setReceiptFooter(o.receipt_footer ?? "");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateOutlet(editing.id, {
          name,
          phone: phone || undefined,
          address: address || undefined,
          receipt_header: receiptHeader || undefined,
          receipt_footer: receiptFooter || undefined,
        });
        showToast("Outlet updated.", "success");
      } else {
        await createOutlet({
          name,
          code,
          phone: phone || undefined,
          address: address || undefined,
          receipt_header: receiptHeader || undefined,
          receipt_footer: receiptFooter || undefined,
        });
        showToast("Outlet created.", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save outlet.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id: number) {
    if (!confirm("Deactivate this outlet?")) return;
    try {
      await deleteOutlet(id);
      showToast("Outlet deactivated.", "info");
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to deactivate outlet.",
        "error"
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outlets / Stores</h1>
          <p className="text-sm text-zinc-500">
            Manage store branches, registers, and receipt branding
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          <FiPlus className="h-4 w-4" />
          <span>Add Outlet</span>
        </button>
      </div>

      <input
        type="search"
        placeholder="Search outlets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
      />

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3 text-right">Staff</th>
              <th className="px-4 py-3 text-right">Registers</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Loading...
                </td>
              </tr>
            ) : outlets.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No outlets found.
                </td>
              </tr>
            ) : (
              outlets.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {o.code}
                  </td>
                  <td className="px-4 py-3 font-medium">{o.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{o.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-mono">
                    {o.staff_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {o.registers_count ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={o.is_active ? "Active" : "Inactive"}
                      tone={o.is_active ? "success" : "neutral"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(o)}
                        aria-label={`Edit ${o.name}`}
                        title="Edit"
                        className="rounded-lg border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeactivate(o.id)}
                        aria-label={`Deactivate ${o.name}`}
                        title="Deactivate"
                        className="rounded-lg border border-red-300 p-1.5 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Outlet" : "Add Outlet"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Outlet Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            <input
              required
              disabled={Boolean(editing)}
              placeholder="Code (e.g. PP-02)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
            />
          </div>
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <input
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <input
            placeholder="Receipt Header"
            value={receiptHeader}
            onChange={(e) => setReceiptHeader(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <input
            placeholder="Receipt Footer"
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
