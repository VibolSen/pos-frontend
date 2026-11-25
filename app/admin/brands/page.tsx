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
  StatusBadge,
  Textarea,
  type Column,
} from "@/components/ui";
import { createBrand, deleteBrand, getBrands, updateBrand } from "@/lib/api";
import type { Brand } from "@/lib/types";

export default function AdminBrandsPage() {
  const { showToast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBrands(search || undefined);
      setBrands(res.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load brands.",
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
    setDescription("");
    setModalOpen(true);
  }

  function openEdit(brand: Brand) {
    setEditing(brand);
    setName(brand.name);
    setDescription(brand.description ?? "");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateBrand(editing.id, { name, description });
        showToast("Brand updated.", "success");
      } else {
        await createBrand({ name, description });
        showToast("Brand created.", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save brand.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this brand?")) return;
    try {
      await deleteBrand(id);
      showToast("Brand deleted.", "info");
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete brand.",
        "error"
      );
    }
  }

  const columns: Column<Brand>[] = [
    {
      key: "name",
      header: "Brand",
      render: (b) => <span className="font-medium">{b.name}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      render: (b) => (
        <span className="font-mono text-xs text-zinc-500">{b.slug}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (b) => (
        <StatusBadge
          label={b.is_active ? "Active" : "Inactive"}
          tone={b.is_active ? "success" : "neutral"}
        />
      ),
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      render: (b) => (
        <span className="font-mono">{b.products_count ?? 0}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (b) => (
        <div className="inline-flex gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEdit(b)}
            aria-label={`Edit ${b.name}`}
            title="Edit"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(b.id)}
            aria-label={`Delete ${b.name}`}
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
        title="Brands"
        subtitle="Manage product brands"
        actions={
          <Button onClick={openCreate} aria-label="Add Brand" title="Add Brand">
            <FiPlus className="h-4 w-4" />
            <span>Add Brand</span>
          </Button>
        }
      />

      <Input
        type="search"
        placeholder="Search brands..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm bg-white dark:bg-zinc-900"
      />

      <DataTable
        columns={columns}
        data={brands}
        rowKey={(b) => b.id}
        loading={loading}
        emptyMessage="No brands found."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Brand" : "Add Brand"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            label="Description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
