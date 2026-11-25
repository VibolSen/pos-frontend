"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from "react-icons/fi";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/ToastProvider";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProduct,
  getProducts,
  updateProduct,
} from "@/lib/api";
import type { Category, Product } from "@/lib/types";

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [costPrice, setCostPrice] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [initialStock, setInitialStock] = useState("100");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({ q: search || undefined }),
        getCategories(),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load products.",
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
    setSku("");
    setSellingPrice("");
    setCostPrice("0");
    setCategoryId("");
    setDescription("");
    setInitialStock("100");
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setName(product.name);
    setSku(product.sku);
    setSellingPrice(String(product.price ?? product.selling_price ?? 0));
    setCostPrice(String(product.cost_price ?? 0));
    setCategoryId(product.category_id ? String(product.category_id) : "");
    setDescription(product.description ?? "");
    setModalOpen(true);
  }

  async function handleViewDetail(id: number) {
    try {
      const res = await getProduct(id);
      setDetailProduct(res.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load product detail.",
        "error"
      );
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateProduct(editing.id, {
          name,
          selling_price: Number(sellingPrice),
          cost_price: Number(costPrice) || 0,
          category_id: categoryId ? Number(categoryId) : null,
          description: description || undefined,
        });
        showToast("Product updated.", "success");
      } else {
        await createProduct({
          name,
          sku,
          selling_price: Number(sellingPrice),
          cost_price: Number(costPrice) || 0,
          category_id: categoryId ? Number(categoryId) : null,
          description: description || undefined,
          initial_stock: Number(initialStock) || 0,
        });
        showToast("Product created.", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save product.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deactivate this product?")) return;
    try {
      await deleteProduct(id);
      showToast("Product deactivated.", "info");
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete product.",
        "error"
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500">
            Manage retail catalog, pricing, and initial stock
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          <FiPlus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <input
        type="search"
        placeholder="Search by product name or SKU..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
      />

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Cost</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      onClick={() => handleViewDetail(p.id)}
                      className="text-left hover:underline"
                    >
                      {p.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {p.sku}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {p.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ${Number(p.cost_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">
                    ${Number(p.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {Number(p.stock_on_hand ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleViewDetail(p.id)}
                        aria-label={`View ${p.name}`}
                        title="View Details"
                        className="rounded-lg border border-zinc-300 p-1.5 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <FiEye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.name}`}
                        title="Edit"
                        className="rounded-lg border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        aria-label={`Deactivate ${p.name}`}
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
        title={editing ? `Edit ${editing.name}` : "Add New Product"}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">SKU</label>
              <input
                required
                disabled={Boolean(editing)}
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                Selling Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                Cost Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {!editing && (
              <div>
                <label className="mb-1 block text-xs font-medium">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
                />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
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
              {saving ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(detailProduct)}
        onClose={() => setDetailProduct(null)}
        title={detailProduct?.name ?? "Product Detail"}
      >
        {detailProduct && (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-zinc-500">SKU:</span>{" "}
              <code className="font-mono">{detailProduct.sku}</code>
            </p>
            <p>
              <span className="text-zinc-500">Category:</span>{" "}
              {detailProduct.category_name ?? "Uncategorized"}
            </p>
            <p>
              <span className="text-zinc-500">Selling Price:</span> $
              {Number(detailProduct.selling_price ?? 0).toFixed(2)}
            </p>
            <p>
              <span className="text-zinc-500">Cost Price:</span> $
              {Number(detailProduct.cost_price ?? 0).toFixed(2)}
            </p>
            <p>
              <span className="text-zinc-500">Description:</span>{" "}
              {detailProduct.description ?? "—"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
