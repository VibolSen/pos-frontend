"use client";

import Link from "next/link";
import { FiMenu, FiMonitor } from "react-icons/fi";
import { useAuth } from "@/components/AuthProvider";
import { ThemeToggleButton } from "@/components/ThemeProvider";

export function Header({
  title = "Back-Office Management",
  onOpenMobileMenu,
}: {
  title?: string;
  onOpenMobileMenu?: () => void;
}) {
  const { hasRole } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open menu"
            title="Menu"
            className="rounded-lg border border-zinc-200 p-2 text-zinc-700 lg:hidden dark:border-zinc-700 dark:text-zinc-200"
          >
            <FiMenu className="h-4 w-4" />
          </button>
        )}
        <span className="text-sm font-medium text-zinc-500">{title}</span>
      </div>

      <div className="flex items-center gap-2.5">
        <ThemeToggleButton />
        {hasRole([
          "super_admin",
          "admin",
          "outlet_manager",
          "supervisor",
          "cashier",
        ]) && (
          <Link
            href="/pos"
            title="Open POS Terminal"
            aria-label="Open POS Terminal"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500"
          >
            <FiMonitor className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">POS</span>
          </Link>
        )}
      </div>
    </header>
  );
}
