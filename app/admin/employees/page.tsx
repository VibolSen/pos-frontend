"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiUserX } from "react-icons/fi";
import { Modal } from "@/components/Modal";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import {
  createDepartment,
  createEmployee,
  deleteDepartment,
  deleteEmployee,
  getDepartments,
  getEmployees,
  getOutlets,
  updateDepartment,
  updateEmployee,
} from "@/lib/api";
import type { Department, Employee, Outlet } from "@/lib/types";

export default function AdminEmployeesPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<"employees" | "departments">("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [empEmail, setEmpEmail] = useState("");
  const [empPhone, setEmpPhone] = useState("");
  const [empDeptId, setEmpDeptId] = useState("");
  const [empOutletId, setEmpOutletId] = useState("");
  const [designation, setDesignation] = useState("Cashier");
  const [employmentType, setEmploymentType] = useState<
    "Full-time" | "Part-time" | "Contract"
  >("Full-time");
  const [salary, setSalary] = useState("0");

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, outRes] = await Promise.all([
        getEmployees({
          q: search || undefined,
          department_id: departmentFilter || undefined,
        }),
        getDepartments(search || undefined),
        getOutlets(),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
      setOutlets(outRes.data);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to load HRM data.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [search, departmentFilter, showToast]);

  useEffect(() => {
    const t = setTimeout(loadData, 150);
    return () => clearTimeout(t);
  }, [loadData]);

  function openCreateEmp() {
    setEditingEmp(null);
    setFirstName("");
    setLastName("");
    setEmpEmail("");
    setEmpPhone("");
    setEmpDeptId("");
    setEmpOutletId(outlets[0] ? String(outlets[0].id) : "1");
    setDesignation("Cashier");
    setEmploymentType("Full-time");
    setSalary("0");
    setEmpModalOpen(true);
  }

  function openEditEmp(e: Employee) {
    setEditingEmp(e);
    setFirstName(e.first_name);
    setLastName(e.last_name);
    setEmpEmail(e.email ?? "");
    setEmpPhone(e.phone ?? "");
    setEmpDeptId(e.department_id ? String(e.department_id) : "");
    setEmpOutletId(e.outlet_id ? String(e.outlet_id) : "");
    setDesignation(e.designation);
    setEmploymentType(
      (e.employment_type as "Full-time" | "Part-time" | "Contract") ||
        "Full-time"
    );
    setSalary(String(e.salary ?? 0));
    setEmpModalOpen(true);
  }

  async function handleSaveEmp(ev: FormEvent) {
    ev.preventDefault();
    setSaving(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: empEmail || undefined,
        phone: empPhone || undefined,
        department_id: empDeptId ? Number(empDeptId) : null,
        outlet_id: empOutletId ? Number(empOutletId) : null,
        designation,
        employment_type: employmentType,
        salary: Number(salary) || 0,
      };
      if (editingEmp) {
        await updateEmployee(editingEmp.id, payload);
        showToast("Employee updated.", "success");
      } else {
        await createEmployee(payload);
        showToast("Employee created.", "success");
      }
      setEmpModalOpen(false);
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save employee.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDept(ev: FormEvent) {
    ev.preventDefault();
    setSaving(true);
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, {
          name: deptName,
          description: deptDesc || undefined,
        });
        showToast("Department updated.", "success");
      } else {
        await createDepartment({
          name: deptName,
          code: deptCode,
          description: deptDesc || undefined,
        });
        showToast("Department created.", "success");
      }
      setDeptModalOpen(false);
      loadData();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to save department.",
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
          <h1 className="text-2xl font-bold tracking-tight">HRM & Staff</h1>
          <p className="text-sm text-zinc-500">
            Manage store employees and departments
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (tab === "employees") openCreateEmp();
            else {
              setEditingDept(null);
              setDeptName("");
              setDeptCode("");
              setDeptDesc("");
              setDeptModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          <FiPlus className="h-4 w-4" />
          <span>{tab === "employees" ? "Add Employee" : "Add Department"}</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["employees", "departments"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${
                tab === t
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "border border-zinc-300 bg-white text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-sm outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          {tab === "employees" && (
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {tab === "employees" ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                      {e.employee_code}
                    </td>
                    <td className="px-4 py-3 font-medium">{e.full_name}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {e.department_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">{e.designation}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {e.employment_type}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={e.is_active ? "Active" : "Inactive"}
                        tone={e.is_active ? "success" : "neutral"}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditEmp(e)}
                          aria-label={`Edit ${e.full_name}`}
                          title="Edit"
                          className="rounded-lg border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          <FiEdit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("Deactivate employee?")) return;
                            await deleteEmployee(e.id);
                            showToast("Employee deactivated.", "info");
                            loadData();
                          }}
                          aria-label={`Deactivate ${e.full_name}`}
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
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Employees</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {departments.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {d.code}
                  </td>
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {d.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {d.employees_count ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDept(d);
                          setDeptName(d.name);
                          setDeptCode(d.code);
                          setDeptDesc(d.description ?? "");
                          setDeptModalOpen(true);
                        }}
                        aria-label={`Edit ${d.name}`}
                        title="Edit"
                        className="rounded-lg border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!confirm("Delete department?")) return;
                          await deleteDepartment(d.id);
                          showToast("Department deleted.", "info");
                          loadData();
                        }}
                        aria-label={`Delete ${d.name}`}
                        title="Delete"
                        className="rounded-lg border border-red-300 p-1.5 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Employee Modal */}
      <Modal
        open={empModalOpen}
        onClose={() => setEmpModalOpen(false)}
        title={editingEmp ? "Edit Employee" : "Add Employee"}
      >
        <form onSubmit={handleSaveEmp} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            <input
              required
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              placeholder="Email"
              value={empEmail}
              onChange={(e) => setEmpEmail(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            <input
              placeholder="Phone"
              value={empPhone}
              onChange={(e) => setEmpPhone(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={empDeptId}
              onChange={(e) => setEmpDeptId(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">No Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={empOutletId}
              onChange={(e) => setEmpOutletId(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              required
              placeholder="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
            <select
              value={employmentType}
              onChange={(e) =>
                setEmploymentType(
                  e.target.value as "Full-time" | "Part-time" | "Contract"
                )
              }
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEmpModalOpen(false)}
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

      {/* Department Modal */}
      <Modal
        open={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? "Edit Department" : "Add Department"}
      >
        <form onSubmit={handleSaveDept} className="flex flex-col gap-4">
          <input
            required
            placeholder="Department Name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <input
            required
            disabled={Boolean(editingDept)}
            placeholder="Department Code (e.g. SALES)"
            value={deptCode}
            onChange={(e) => setDeptCode(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm disabled:opacity-50 dark:border-zinc-700"
          />
          <textarea
            rows={2}
            placeholder="Description"
            value={deptDesc}
            onChange={(e) => setDeptDesc(e.target.value)}
            className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeptModalOpen(false)}
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
    </div>
  );
}
