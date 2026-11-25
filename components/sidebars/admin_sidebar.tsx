"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiX } from "react-icons/fi";
import { useAuth } from "@/components/AuthProvider";
import { StatusBadge } from "@/components/StatusBadge";
import type { UserRole } from "@/lib/types";

export interface SidebarNavItem {
  href: string;
  label: string;
  roles: UserRole[];
}

export interface SidebarNavGroup {
  title: string;
  items: SidebarNavItem[];
}

export const ADMIN_NAV_GROUPS: SidebarNavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        roles: ["super_admin", "admin", "outlet_manager", "accountant"],
      },
      {
        href: "/pos",
        label: "POS Terminal",
        roles: [
          "super_admin",
          "admin",
          "outlet_manager",
          "supervisor",
          "cashier",
        ],
      },
    ],
  },
  {
    title: "Catalog & Stock",
    items: [
      {
        href: "/admin/products",
        label: "Products",
        roles: ["super_admin", "admin", "outlet_manager", "inventory_clerk"],
      },
      {
        href: "/admin/categories",
        label: "Categories",
        roles: ["super_admin", "admin", "outlet_manager", "inventory_clerk"],
      },
      {
        href: "/admin/brands",
        label: "Brands",
        roles: ["super_admin", "admin", "outlet_manager", "inventory_clerk"],
      },
      {
        href: "/admin/inventory",
        label: "Inventory",
        roles: ["super_admin", "admin", "outlet_manager", "inventory_clerk"],
      },
    ],
  },
  {
    title: "Operations & People",
    items: [
      {
        href: "/admin/customers",
        label: "Customers",
        roles: ["super_admin", "admin", "outlet_manager"],
      },
      {
        href: "/admin/suppliers",
        label: "Suppliers",
        roles: ["super_admin", "admin", "outlet_manager"],
      },
      {
        href: "/admin/outlets",
        label: "Outlets",
        roles: ["super_admin", "admin", "outlet_manager"],
      },
      {
        href: "/admin/employees",
        label: "HRM & Staff",
        roles: ["super_admin", "admin", "outlet_manager"],
      },
      {
        href: "/admin/users",
        label: "Users & Roles",
        roles: ["super_admin", "admin"],
      },
    ],
  },
];

export function SidebarFrame({
  brandLabel,
  brandHref,
  groups,
  mobileOpen,
  onCloseMobile,
}: {
  brandLabel: string;
  brandHref: string;
  groups: SidebarNavGroup[];
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform lg:sticky lg:top-0 lg:translate-x-0 dark:border-zinc-800 dark:bg-zinc-900 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-5 dark:border-zinc-800">
          <Link href={brandHref} className="text-base font-bold tracking-tight">
            {brandLabel}
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
            className="rounded-lg p-1.5 text-zinc-500 lg:hidden"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
          {groups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              hasRole(item.roles)
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title}>
                <p className="mb-1 px-3 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">
                  {group.title}
                </p>
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onCloseMobile}
                          className={`block rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                            active
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800">
          <div className="mb-2.5 flex flex-col gap-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <div className="flex items-center gap-2">
              <StatusBadge label={user?.role ?? "staff"} tone="info" />
              <span className="text-xs text-zinc-500">
                Outlet #{user?.outlet_id ?? 1}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign Out"
            title="Sign Out"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <FiLogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
    </>
  );
}

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <SidebarFrame
      brandLabel="POS Admin"
      brandHref="/admin/dashboard"
      groups={ADMIN_NAV_GROUPS}
      mobileOpen={mobileOpen}
      onCloseMobile={onCloseMobile}
    />
  );
}
