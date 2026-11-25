"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { useToast } from "@/components/ToastProvider";
import {
  Button,
  DataTable,
  Input,
  Modal,
  PageHeader,
  type Column,
} from "@/components/ui";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "@/lib/api";
import type { Customer } from "@/lib/types";

export default function AdminCustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loyaltyPoints, setLoyaltyPoints] = useState("0");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers(search || undefined);
      setCustomers(res.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load customers.",
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
    setEmail("");
    setPhone("");
    setAddress("");
    setLoyaltyPoints("0");
    setModalOpen(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setName(c.name);
    setEmail(c.email ?? "");
    setPhone(c.phone ?? "");
    setAddress(c.address ?? "");
    setLoyaltyPoints(String(c.loyalty_points ?? 0));
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCustomer(editing.id, {
          name,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
          loyalty_points: Number(loyaltyPoints) || 0,
        });
        showToast("Customer updated.", "success");
      } else {
        await createCustomer({
          name,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
        });
        showToast("Customer created.", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save customer.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      showToast("Customer deleted.", "info");
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete customer.",
        "error"
      );
    }
  }

  const columns: Column<Customer>[] = [
    {
      key: "code",
      header: "Code",
      render: (c) => (
        <span className="font-mono text-xs text-zinc-500">{c.code}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (c) => <span className="font-medium">{c.name}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (c) => <span className="text-zinc-500">{c.phone ?? "—"}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (c) => <span className="text-zinc-500">{c.email ?? "—"}</span>,
    },
    {
      key: "points",
      header: "Points",
      align: "right",
      render: (c) => <span className="font-mono">{c.loyalty_points}</span>,
    },
    {
      key: "spent",
      header: "Total Spent",
      align: "right",
      render: (c) => (
        <span className="font-mono">${Number(c.total_spent).toFixed(2)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (c) => (
        <div className="inline-flex gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEdit(c)}
            aria-label={`Edit ${c.name}`}
            title="Edit"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(c.id)}
            aria-label={`Delete ${c.name}`}
            title="Delete"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        subtitle="Customer directory and loyalty points"
        actions={
          <Button onClick={openCreate} aria-label="Add Customer" title="Add Customer">
            <FiPlus className="h-4 w-4" />
            <span>Add Customer</span>
          </Button>
        }
      />

      <Input
        type="search"
        placeholder="Search by name, code, phone, or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm bg-white dark:bg-zinc-900"
      />

      <DataTable
        columns={columns}
        data={customers}
        rowKey={(c) => c.id}
        loading={loading}
        emptyMessage="No customers found."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Customer" : "Add Customer"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Input
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {editing && (
            <Input
              label="Loyalty Points"
              type="number"
              value={loyaltyPoints}
              onChange={(e) => setLoyaltyPoints(e.target.value)}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
