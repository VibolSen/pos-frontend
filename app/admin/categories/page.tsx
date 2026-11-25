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
  Select,
  type Column,
} from "@/components/ui";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCategories(search || undefined);
      setCategories(res.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load categories.",
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
    setParentId("");
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setParentId(cat.parent_id ? String(cat.parent_id) : "");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        parent_id: parentId ? Number(parentId) : null,
      };
      if (editing) {
        await updateCategory(editing.id, payload);
        showToast("Category updated.", "success");
      } else {
        await createCategory(payload);
        showToast("Category created.", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save category.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      showToast("Category deleted.", "info");
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete category.",
        "error"
      );
    }
  }

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Name",
      render: (cat) => <span className="font-medium">{cat.name}</span>,
    },
    {
      key: "slug",
      header: "Slug",
      render: (cat) => (
        <span className="font-mono text-xs text-zinc-500">{cat.slug}</span>
      ),
    },
    {
      key: "parent",
      header: "Parent",
      render: (cat) => (
        <span className="text-zinc-500">{cat.parent_name ?? "—"}</span>
      ),
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      render: (cat) => (
        <span className="font-mono">{cat.products_count ?? 0}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (cat) => (
        <div className="inline-flex gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openEdit(cat)}
            aria-label={`Edit ${cat.name}`}
            title="Edit"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(cat.id)}
            aria-label={`Delete ${cat.name}`}
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
        title="Categories"
        subtitle="Organize products into categories and sub-categories"
        actions={
          <Button onClick={openCreate} aria-label="Add Category" title="Add Category">
            <FiPlus className="h-4 w-4" />
            <span>Add Category</span>
          </Button>
        }
      />

      <Input
        type="search"
        placeholder="Search categories..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm bg-white dark:bg-zinc-900"
      />

      <DataTable
        columns={columns}
        data={categories}
        rowKey={(cat) => cat.id}
        loading={loading}
        emptyMessage="No categories found."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            label="Parent Category (Optional)"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">None (Top-level)</option>
            {categories
              .filter((c) => c.id !== editing?.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>
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
