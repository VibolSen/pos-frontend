"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusBadge";
import { ThemeToggleButton } from "@/components/ThemeProvider";

export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (
      !hasRole([
        "super_admin",
        "admin",
        "outlet_manager",
        "supervisor",
        "cashier",
      ])
    ) {
      router.replace("/admin/dashboard");
    }
  }, [user, loading, hasRole, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm text-zinc-500 dark:bg-zinc-950">
        Loading POS terminal...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:px-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold tracking-tight">
            POS Terminal
          </span>
          <StatusBadge label={`Outlet #${user.outlet_id ?? 1}`} tone="neutral" />
          <StatusBadge label={user.role} tone="info" />
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggleButton />
          <span className="hidden text-sm text-zinc-500 sm:inline">
            {user.name}
          </span>
          {hasRole([
            "super_admin",
            "admin",
            "outlet_manager",
            "inventory_clerk",
            "accountant",
          ]) && (
            <Link
              href="/admin/dashboard"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Admin Back-Office
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
