"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { PinOverrideModal } from "@/components/PinOverrideModal";
import { HeldCartsDrawer } from "@/components/pos/HeldCartsDrawer";
import { ReceiptModal } from "@/components/pos/ReceiptModal";
import { ShiftModal } from "@/components/pos/ShiftModal";
import {
  discardHeldCart,
  getActiveShift,
  getCategories,
  getHeldCarts,
  getProducts,
  holdCart,
  lookupBarcode,
  resumeHeldCart,
  submitSale,
} from "@/lib/api";
import type {
  ActiveShiftData,
  Category,
  CheckoutResponse,
  HeldCart,
  Product,
} from "@/lib/types";

interface CartLine {
  product_id: number;
  name: string;
  sku: string;
  price: number;
  qty: number;
}

export default function PosTerminalPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const outletId = user?.outlet_id ?? 1;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [activeShift, setActiveShift] = useState<ActiveShiftData | null>(null);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [discountInput, setDiscountInput] = useState("0");
  const [taxInput, setTaxInput] = useState("0");
  const [discountUnlocked, setDiscountUnlocked] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const [tenderType, setTenderType] = useState<"cash" | "khqr" | "aba_payway">(
    "cash"
  );
  const [currency, setCurrency] = useState<"USD" | "KHR">("USD");
  const [checkingOut, setCheckingOut] = useState(false);

  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [heldDrawerOpen, setHeldDrawerOpen] = useState(false);
  const [receipt, setReceipt] = useState<CheckoutResponse | null>(null);

  const loadShiftAndHeld = useCallback(async () => {
    try {
      const [shiftRes, heldRes] = await Promise.all([
        getActiveShift(),
        getHeldCarts(outletId),
      ]);
      setActiveShift(shiftRes.data);
      setHeldCarts(heldRes.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load shift status.",
        "error"
      );
    }
  }, [outletId, showToast]);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        getProducts({
          outlet_id: outletId,
          category_id: selectedCategory || undefined,
          q: search || undefined,
        }),
        getCategories(),
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load catalog.",
        "error"
      );
    } finally {
      setLoadingCatalog(false);
    }
  }, [outletId, selectedCategory, search, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadShiftAndHeld();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadShiftAndHeld]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCatalog();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadCatalog]);

  function addProductToCart(product: Product) {
    const unitPrice = Number(product.price ?? product.selling_price ?? 0);
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          sku: product.sku,
          price: unitPrice,
          qty: 1,
        },
      ];
    });
  }

  async function handleBarcodeSubmit(e: FormEvent) {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;
    try {
      const res = await lookupBarcode(code);
      addProductToCart(res.data);
      setBarcodeInput("");
      showToast(`Added ${res.data.name}`, "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : `Barcode "${code}" not found.`,
        "error"
      );
    }
  }

  function updateQty(productId: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product_id === productId
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );
  const discountTotal = Math.max(0, Number(discountInput) || 0);
  const taxTotal = Math.max(0, Number(taxInput) || 0);
  const grandTotal = Math.max(0, subtotal - discountTotal + taxTotal);

  async function handleHoldCart() {
    if (cart.length === 0) return;
    try {
      const res = await holdCart({
        outlet_id: outletId,
        items: cart.map((c) => ({
          product_id: c.product_id,
          name: c.name,
          price: c.price,
          qty: c.qty,
        })),
      });
      setCart([]);
      setDiscountInput("0");
      setTaxInput("0");
      showToast(res.message, "info");
      loadShiftAndHeld();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to hold cart.",
        "error"
      );
    }
  }

  async function handleResumeHeld(id: string) {
    try {
      const res = await resumeHeldCart(id, outletId);
      setCart(
        res.data.items.map((i) => ({
          product_id: i.product_id,
          name: i.name,
          sku: "",
          price: Number(i.price),
          qty: Number(i.qty),
        }))
      );
      setHeldDrawerOpen(false);
      showToast(`Resumed ${id}`, "success");
      loadShiftAndHeld();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to resume cart.",
        "error"
      );
    }
  }

  async function handleDiscardHeld(id: string) {
    try {
      await discardHeldCart(id, outletId);
      showToast(`Discarded ${id}`, "info");
      loadShiftAndHeld();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to discard cart.",
        "error"
      );
    }
  }

  async function handleCheckout() {
    if (cart.length === 0) return;
    if (!activeShift) {
      showToast("Please open a shift before completing a sale.", "error");
      setShiftModalOpen(true);
      return;
    }
    if (discountTotal > subtotal) {
      showToast("Discount cannot exceed subtotal.", "error");
      return;
    }

    setCheckingOut(true);
    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sale-${Date.now()}`;

      const res = await submitSale({
        outlet_id: outletId,
        register_id: activeShift.shift.register_id ?? 1,
        shift_id: activeShift.shift.id,
        idempotency_key: idempotencyKey,
        items: cart.map((c) => ({
          product_id: c.product_id,
          quantity: c.qty,
        })),
        tender_type: tenderType,
        currency,
        discount_total: discountTotal,
        tax_total: taxTotal,
      });

      setReceipt(res.data);
      setCart([]);
      setDiscountInput("0");
      setTaxInput("0");
      setDiscountUnlocked(false);
      showToast("Sale completed!", "success");
      loadCatalog();
      loadShiftAndHeld();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Checkout failed.",
        "error"
      );
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] grid-cols-1 lg:grid-cols-12">
      {/* Left: Catalog & Scan */}
      <section className="flex flex-col gap-4 border-b border-zinc-200 p-4 lg:col-span-8 lg:border-r lg:border-b-0 lg:p-6 dark:border-zinc-800">
        {/* Top Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShiftModalOpen(true)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                activeShift
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-amber-500 text-white hover:bg-amber-400"
              }`}
            >
              {activeShift
                ? `Shift #${activeShift.shift.id} Open · Expected $${activeShift.summary.expected_cash.toFixed(2)}`
                : "Open Shift Required"}
            </button>

            <button
              type="button"
              onClick={() => setHeldDrawerOpen(true)}
              className="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              Held Carts ({heldCarts.length})
            </button>
          </div>

          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Scan barcode or SKU..."
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-48 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-900 sm:w-56 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
            >
              Add
            </button>
          </form>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("")}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedCategory === ""
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedCategory === String(cat.id)
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-300 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loadingCatalog ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            Loading catalog...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const stock = Number(product.stock_on_hand ?? 0);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addProductToCart(product)}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-4 text-left transition hover:border-zinc-900 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-400"
                >
                  <div>
                    <p className="text-xs text-zinc-500">
                      {product.category ?? "General"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                      {product.sku}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-mono text-base font-bold">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        stock <= 0 ? "text-red-500" : "text-zinc-500"
                      }`}
                    >
                      {stock} in stock
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Right: Cart & Checkout */}
      <aside className="flex flex-col justify-between bg-white p-4 lg:col-span-4 lg:p-6 dark:bg-zinc-900">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <h2 className="text-base font-semibold">
              Current Order ({cart.reduce((s, c) => s + c.qty, 0)})
            </h2>
            {cart.length > 0 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleHoldCart}
                  className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Hold
                </button>
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-400">
              Select products or scan a barcode to start an order.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {cart.map((item) => (
                <li
                  key={item.product_id}
                  className="flex items-center justify-between gap-2 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="font-mono text-xs text-zinc-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, -1)}
                      className="h-7 w-7 rounded-lg border border-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-mono text-sm">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product_id, 1)}
                      className="h-7 w-7 rounded-lg border border-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-16 text-right font-mono text-sm font-semibold">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Totals & Payment */}
        <div className="mt-6 flex flex-col gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-zinc-500">Discount ($)</label>
                {!discountUnlocked && (
                  <button
                    type="button"
                    onClick={() => setPinModalOpen(true)}
                    className="font-medium text-sky-600 hover:underline dark:text-sky-400"
                  >
                    PIN Unlock
                  </button>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                disabled={!discountUnlocked}
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-1.5 font-mono text-sm disabled:opacity-50 dark:border-zinc-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-zinc-500">Tax ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={taxInput}
                onChange={(e) => setTaxInput(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-1.5 font-mono text-sm dark:border-zinc-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="mb-1 block text-zinc-500">Tender</label>
              <select
                value={tenderType}
                onChange={(e) =>
                  setTenderType(
                    e.target.value as "cash" | "khqr" | "aba_payway"
                  )
                }
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="cash">Cash</option>
                <option value="khqr">KHQR</option>
                <option value="aba_payway">ABA PayWay</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-zinc-500">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as "USD" | "KHR")}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="USD">USD</option>
                <option value="KHR">KHR</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span className="font-mono">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span className="font-mono">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={cart.length === 0 || checkingOut}
            onClick={handleCheckout}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {checkingOut
              ? "Processing Sale..."
              : `Charge $${grandTotal.toFixed(2)}`}
          </button>
        </div>
      </aside>

      <ShiftModal
        open={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        activeShift={activeShift}
        outletId={outletId}
        onUpdated={loadShiftAndHeld}
      />

      <HeldCartsDrawer
        open={heldDrawerOpen}
        onClose={() => setHeldDrawerOpen(false)}
        carts={heldCarts}
        onResume={handleResumeHeld}
        onDiscard={handleDiscardHeld}
      />

      <PinOverrideModal
        open={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        onAuthorized={(approver) => {
          setDiscountUnlocked(true);
          showToast(`Discount unlocked by ${approver.user_name}`, "success");
        }}
      />

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
