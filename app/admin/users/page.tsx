"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FiEdit2, FiKey, FiPlus, FiShield, FiUserX } from "react-icons/fi";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import {
  createUser,
  deleteUser,
  getOutlets,
  getRolePermissions,
  getUsers,
  resetUserPassword,
  updateUser,
} from "@/lib/api";
import type { Outlet, RoleMatrix, User } from "@/lib/types";

const ROLES = [
  "super_admin",
  "admin",
  "outlet_manager",
  "supervisor",
  "cashier",
  "inventory_clerk",
  "accountant",
  "customer",
];

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [roleMatrix, setRoleMatrix] = useState<RoleMatrix | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("cashier");
  const [outletId, setOutletId] = useState("1");
  const [pinCode, setPinCode] = useState("");

  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, oRes, pRes] = await Promise.all([
        getUsers({
          role: roleFilter || undefined,
          q: search || undefined,
        }),
        getOutlets(),
        getRolePermissions(),
      ]);
      setUsers(uRes.data);
      setOutlets(oRes.data);
      setRoleMatrix(pRes.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load users.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, showToast]);

  useEffect(() => {
    const t = setTimeout(loadData, 150);
    return () => clearTimeout(t);
  }, [loadData]);

  function openCreate() {
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("cashier");
    setOutletId(outlets[0] ? String(outlets[0].id) : "1");
    setPinCode("");
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setOutletId(u.outlet_id ? String(u.outlet_id) : "");
    setPinCode("");
    setModalOpen(true);
  }

  async function handleSaveUser(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateUser(editing.id, {
          name,
          email,
          role,
          outlet_id: outletId ? Number(outletId) : null,
          ...(password ? { password } : {}),
          ...(pinCode ? { pin_code: pinCode } : {}),
        });
        showToast("User updated.", "success");
      } else {
        await createUser({
          name,
          email,
          password,
          role,
          outlet_id: outletId ? Number(outletId) : null,
          pin_code: pinCode || undefined,
        });
        showToast("User created.", "success");
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save user.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    setSaving(true);
    try {
      await resetUserPassword(resetTarget.id, newPassword);
      showToast("Password reset successfully.", "success");
      setResetTarget(null);
      setNewPassword("");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to reset password.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Roles</h1>
          <p className="text-sm text-zinc-500">
            Staff accounts, outlet assignments, and RBAC permissions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMatrixOpen(true)}
            title="Role Permissions"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <FiShield className="h-4 w-4" />
            <span>Role Permissions</span>
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Outlet</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge label={u.role} tone="info" />
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {u.outlet_name ?? `Outlet #${u.outlet_id ?? 1}`}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={u.is_active ? "Active" : "Inactive"}
                      tone={u.is_active ? "success" : "danger"}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(u)}
                        aria-label={`Edit ${u.name}`}
                        title="Edit"
                        className="rounded-lg border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setResetTarget(u);
                          setNewPassword("");
                        }}
                        aria-label={`Reset password for ${u.name}`}
                        title="Reset Password"
                        className="rounded-lg border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <FiKey className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm(`Deactivate ${u.name}?`)) return;
                          await deleteUser(u.id);
                          showToast("User deactivated.", "info");
                          loadData();
                        }}
                        aria-label={`Deactivate ${u.name}`}
                        title="Deactivate"
                        className="rounded-lg border border-red-300 p-1.5 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <FiUserX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Add Staff User"}
      >
        <form onSubmit={handleSaveUser} className="flex flex-col gap-4">
          <input
            required
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <input
            type="password"
            required={!editing}
            minLength={6}
            placeholder={
              editing ? "New Password (leave blank to keep)" : "Password (min 6)"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <input
            type="password"
            inputMode="numeric"
            maxLength={10}
            placeholder={
              editing
                ? "New Supervisor PIN (leave blank to keep)"
                : "Supervisor PIN (optional)"
            }
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
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

      {/* Reset Password Modal */}
      <Modal
        open={Boolean(resetTarget)}
        onClose={() => setResetTarget(null)}
        title={`Reset Password — ${resetTarget?.name ?? ""}`}
        maxWidthClass="max-w-sm"
      >
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <input
            type="password"
            required
            minLength={6}
            placeholder="New Password (min 6 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResetTarget(null)}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Reset
            </button>
          </div>
        </form>
      </Modal>

      {/* Role Permissions Matrix Modal */}
      <Modal
        open={matrixOpen}
        onClose={() => setMatrixOpen(false)}
        title="RBAC Role Permissions Matrix"
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-3 text-sm">
          {roleMatrix &&
            Object.entries(roleMatrix).map(([key, info]) => (
              <div
                key={key}
                className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold">{info.name}</span>
                  <code className="font-mono text-xs text-zinc-500">{key}</code>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {info.capabilities.map((cap) => (
                    <StatusBadge key={cap} label={cap} tone="neutral" />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </Modal>
    </div>
  );
}
