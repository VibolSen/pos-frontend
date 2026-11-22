"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  API_BASE_URL,
  ApiError,
  getMe,
  getProducts,
  getStoredToken,
  login,
  logout,
  Product,
  setStoredToken,
  User,
} from "@/lib/api";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState("superadmin@pos.com");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      queueMicrotask(() => setCheckingSession(false));
      return;
    }

    getMe(token)
      .then((res) => setUser(res.user))
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await login(email, password);
      setUser(res.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to reach the backend API. Is Docker/Laravel running?");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLoadProducts() {
    setProductsError(null);
    setLoadingProducts(true);

    try {
      const res = await getProducts(user?.outlet_id ?? 1);
      setProducts(res.data);
    } catch (err) {
      setProductsError(
        err instanceof Error ? err.message : "Failed to load products."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setProducts([]);
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-2 border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              POS System — API Connection Check
            </h1>
            <span className="rounded-full bg-zinc-200 px-3 py-1 font-mono text-xs dark:bg-zinc-800">
              {user ? "Authenticated" : "Not signed in"}
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Backend URL:{" "}
            <code className="rounded bg-zinc-200 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
              {API_BASE_URL}
            </code>
          </p>
        </header>

        {checkingSession ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            Checking existing session...
          </div>
        ) : !user ? (
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-medium">Sign in to Laravel API</h2>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:focus:border-zinc-300"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {submitting ? "Signing in..." : "Sign In & Test Connection"}
              </button>
            </form>
          </section>
        ) : (
          <div className="flex flex-col gap-6">
            <section className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  Connected to Laravel Sanctum API
                </p>
                <p className="text-base font-semibold">{user.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {user.email} · Role:{" "}
                  <code className="font-mono">{user.role}</code> · Outlet #
                  {user.outlet_id ?? 1}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                Sign Out
              </button>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  Live Products Check (<code>GET /products</code>)
                </h2>
                <button
                  onClick={handleLoadProducts}
                  disabled={loadingProducts}
                  className="rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                >
                  {loadingProducts ? "Loading..." : "Fetch Products"}
                </button>
              </div>

              {productsError && (
                <p className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                  {productsError}
                </p>
              )}

              {products.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  Click &ldquo;Fetch Products&rdquo; to verify database + API
                  data flow.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {products.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-zinc-500">
                          SKU: {product.sku} · {product.category ?? "Uncategorized"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-medium">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Stock: {Number(product.stock_on_hand)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
