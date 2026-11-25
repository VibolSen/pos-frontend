import type {
  ActiveShiftData,
  Brand,
  Category,
  CheckoutResponse,
  Customer,
  DashboardCharts,
  DashboardSummary,
  DashboardWidgets,
  Department,
  Employee,
  ExpiredProduct,
  HeldCart,
  HeldCartItem,
  InventoryBalance,
  InventoryMovement,
  Outlet,
  Product,
  RoleMatrix,
  Shift,
  Supplier,
  User,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api/v1";

const TOKEN_STORAGE_KEY = "pos_auth_token";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = options;
  const authToken = token !== undefined ? token : getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      setStoredToken(null);
    }
    const message =
      payload?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload?.errors);
  }

  return payload as T;
}

// ---------- Auth & PIN ----------
export async function login(email: string, password: string) {
  const data = await apiFetch<{ status: string; user: User; token: string }>(
    "/auth/login",
    {
      method: "POST",
      token: null,
      body: JSON.stringify({ email, password }),
    }
  );
  setStoredToken(data.token);
  return data;
}

export async function getMe(token?: string) {
  return apiFetch<{ status: string; user: User }>("/me", { token });
}

export async function logout() {
  try {
    await apiFetch<{ status: string; message: string }>("/auth/logout", {
      method: "POST",
    });
  } finally {
    setStoredToken(null);
  }
}

export async function verifySupervisorPin(pin_code: string) {
  return apiFetch<{
    status: string;
    message: string;
    data: { user_id: number; user_name: string; role: string };
  }>("/auth/verify-pin", {
    method: "POST",
    body: JSON.stringify({ pin_code }),
  });
}

// ---------- Dashboard ----------
export async function getDashboardSummary(outletId = 1) {
  return apiFetch<{ status: string; data: DashboardSummary }>(
    `/admin/dashboard/summary?outlet_id=${outletId}`
  );
}

export async function getDashboardWidgets(outletId = 1) {
  return apiFetch<{ status: string; data: DashboardWidgets }>(
    `/admin/dashboard/widgets?outlet_id=${outletId}`
  );
}

export async function getDashboardCharts() {
  return apiFetch<{ status: string; data: DashboardCharts }>(
    "/admin/dashboard/charts"
  );
}

// ---------- Shifts & Cash Drawer ----------
export async function getActiveShift() {
  return apiFetch<{ status: string; data: ActiveShiftData | null }>(
    "/shifts/active"
  );
}

export async function openShift(payload: {
  opening_float: number;
  outlet_id?: number;
  register_id?: number;
}) {
  return apiFetch<{ status: string; message: string; data: Shift }>(
    "/shifts/open",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function recordCashMovement(
  shiftId: number,
  payload: { type: "in" | "out"; amount: number; reason: string }
) {
  return apiFetch<{ status: string; message: string }>(
    `/shifts/${shiftId}/cash-movement`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function closeShift(
  shiftId: number,
  payload: { counted_cash: number; closing_note?: string }
) {
  return apiFetch<{
    status: string;
    message: string;
    data: {
      shift_id: number;
      expected_cash: number;
      counted_cash: number;
      cash_variance: number;
    };
  }>(`/shifts/${shiftId}/close`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------- Held Carts ----------
export async function holdCart(payload: {
  items: HeldCartItem[];
  customer_name?: string;
  note?: string;
  outlet_id?: number;
}) {
  return apiFetch<{ status: string; message: string; data: HeldCart }>(
    "/carts/hold",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getHeldCarts(outletId = 1) {
  return apiFetch<{ status: string; data: HeldCart[] }>(
    `/carts/held?outlet_id=${outletId}`
  );
}

export async function resumeHeldCart(id: string, outletId = 1) {
  return apiFetch<{ status: string; message: string; data: HeldCart }>(
    `/carts/held/${encodeURIComponent(id)}/resume?outlet_id=${outletId}`,
    { method: "POST" }
  );
}

export async function discardHeldCart(id: string, outletId = 1) {
  return apiFetch<{ status: string; message: string }>(
    `/carts/held/${encodeURIComponent(id)}?outlet_id=${outletId}`,
    { method: "DELETE" }
  );
}

// ---------- Checkout / Sales ----------
export async function submitSale(payload: {
  outlet_id: number;
  register_id: number;
  shift_id?: number | null;
  idempotency_key: string;
  items: Array<{ product_id: number; variant_id?: number | null; quantity: number }>;
  tender_type: string;
  currency?: "USD" | "KHR";
  tax_total?: number;
  discount_total?: number;
}) {
  return apiFetch<{
    status: string;
    message: string;
    data: CheckoutResponse;
  }>("/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------- Products, Categories & Brands ----------
export async function getProducts(params?: {
  outlet_id?: number;
  category_id?: number | string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.outlet_id) qs.set("outlet_id", String(params.outlet_id));
  if (params?.category_id) qs.set("category_id", String(params.category_id));
  if (params?.q) qs.set("q", params.q);
  const query = qs.toString();
  return apiFetch<{ status: string; data: Product[] }>(
    `/products${query ? `?${query}` : ""}`
  );
}

export async function getProduct(id: number) {
  return apiFetch<{ status: string; data: Product }>(`/products/${id}`);
}

export async function lookupBarcode(code: string) {
  return apiFetch<{ status: string; data: Product }>(
    `/barcodes/${encodeURIComponent(code)}`
  );
}

export async function createProduct(payload: {
  name: string;
  sku: string;
  selling_price: number;
  cost_price?: number;
  category_id?: number | null;
  description?: string;
  initial_stock?: number;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/products",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function updateProduct(
  id: number,
  payload: Partial<{
    name: string;
    selling_price: number;
    cost_price: number;
    category_id: number | null;
    description: string;
  }>
) {
  return apiFetch<{ status: string; message: string }>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: number) {
  return apiFetch<{ status: string; message: string }>(`/products/${id}`, {
    method: "DELETE",
  });
}

export async function getCategories(q?: string) {
  return apiFetch<{ status: string; data: Category[] }>(
    `/categories${q ? `?q=${encodeURIComponent(q)}` : ""}`
  );
}

export async function createCategory(payload: {
  name: string;
  parent_id?: number | null;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/categories",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updateCategory(
  id: number,
  payload: { name: string; parent_id?: number | null }
) {
  return apiFetch<{ status: string; message: string }>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(id: number) {
  return apiFetch<{ status: string; message: string }>(`/categories/${id}`, {
    method: "DELETE",
  });
}

export async function getBrands(q?: string) {
  return apiFetch<{ status: string; data: Brand[] }>(
    `/brands${q ? `?q=${encodeURIComponent(q)}` : ""}`
  );
}

export async function createBrand(payload: {
  name: string;
  description?: string;
  logo?: string;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/brands",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updateBrand(
  id: number,
  payload: { name: string; description?: string; logo?: string }
) {
  return apiFetch<{ status: string; message: string }>(`/brands/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteBrand(id: number) {
  return apiFetch<{ status: string; message: string }>(`/brands/${id}`, {
    method: "DELETE",
  });
}

// ---------- Inventory ----------
export async function getInventoryBalances(params?: {
  outlet_id?: number;
  status?: string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.outlet_id) qs.set("outlet_id", String(params.outlet_id));
  if (params?.status) qs.set("status", params.status);
  if (params?.q) qs.set("q", params.q);
  const query = qs.toString();
  return apiFetch<{ status: string; data: InventoryBalance[] }>(
    `/inventory/balances${query ? `?${query}` : ""}`
  );
}

export async function getInventoryMovements(params?: {
  outlet_id?: number;
  type?: string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.outlet_id) qs.set("outlet_id", String(params.outlet_id));
  if (params?.type) qs.set("type", params.type);
  if (params?.q) qs.set("q", params.q);
  const query = qs.toString();
  return apiFetch<{ status: string; data: InventoryMovement[] }>(
    `/inventory/movements${query ? `?${query}` : ""}`
  );
}

export async function getExpiredInventory(params?: {
  outlet_id?: number;
  status?: string;
  q?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.outlet_id) qs.set("outlet_id", String(params.outlet_id));
  if (params?.status) qs.set("status", params.status);
  if (params?.q) qs.set("q", params.q);
  const query = qs.toString();
  return apiFetch<{ status: string; data: ExpiredProduct[] }>(
    `/inventory/expired${query ? `?${query}` : ""}`
  );
}

export async function receiveInventory(payload: {
  outlet_id: number;
  po_number?: string;
  supplier_name?: string;
  items: Array<{ product_id: number; quantity: number; unit_cost?: number }>;
}) {
  return apiFetch<{ status: string; message: string; po_number: string }>(
    "/inventory/receive",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function adjustInventory(payload: {
  outlet_id: number;
  product_id: number;
  quantity: number;
  type: "increment" | "decrement";
  reason: "spoilage" | "damaged" | "count_variance" | "found" | "other";
  notes?: string;
}) {
  return apiFetch<{ status: string; message: string }>("/inventory/adjust", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------- Customers, Suppliers & Outlets ----------
export async function getCustomers(q?: string) {
  return apiFetch<{ status: string; data: Customer[] }>(
    `/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`
  );
}

export async function createCustomer(payload: {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/customers",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updateCustomer(
  id: number,
  payload: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    loyalty_points?: number;
  }
) {
  return apiFetch<{ status: string; message: string }>(`/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCustomer(id: number) {
  return apiFetch<{ status: string; message: string }>(`/customers/${id}`, {
    method: "DELETE",
  });
}

export async function getSuppliers(q?: string) {
  return apiFetch<{ status: string; data: Supplier[] }>(
    `/suppliers${q ? `?q=${encodeURIComponent(q)}` : ""}`
  );
}

export async function createSupplier(payload: {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/suppliers",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updateSupplier(
  id: number,
  payload: {
    name: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
) {
  return apiFetch<{ status: string; message: string }>(`/suppliers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteSupplier(id: number) {
  return apiFetch<{ status: string; message: string }>(`/suppliers/${id}`, {
    method: "DELETE",
  });
}

export async function getOutlets(q?: string) {
  return apiFetch<{ status: string; data: Outlet[] }>(
    `/outlets${q ? `?q=${encodeURIComponent(q)}` : ""}`
  );
}

export async function createOutlet(payload: {
  name: string;
  code: string;
  phone?: string;
  address?: string;
  receipt_header?: string;
  receipt_footer?: string;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/outlets",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updateOutlet(
  id: number,
  payload: {
    name: string;
    phone?: string;
    address?: string;
    receipt_header?: string;
    receipt_footer?: string;
  }
) {
  return apiFetch<{ status: string; message: string }>(`/outlets/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteOutlet(id: number) {
  return apiFetch<{ status: string; message: string }>(`/outlets/${id}`, {
    method: "DELETE",
  });
}

// ---------- HRM: Departments & Employees ----------
export async function getDepartments(q?: string) {
  return apiFetch<{ status: string; data: Department[] }>(
    `/departments${q ? `?q=${encodeURIComponent(q)}` : ""}`
  );
}

export async function createDepartment(payload: {
  name: string;
  code: string;
  description?: string;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/departments",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updateDepartment(
  id: number,
  payload: { name: string; description?: string }
) {
  return apiFetch<{ status: string; message: string }>(`/departments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDepartment(id: number) {
  return apiFetch<{ status: string; message: string }>(`/departments/${id}`, {
    method: "DELETE",
  });
}

export async function getEmployees(params?: {
  q?: string;
  department_id?: number | string;
}) {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.department_id)
    qs.set("department_id", String(params.department_id));
  const query = qs.toString();
  return apiFetch<{ status: string; data: Employee[] }>(
    `/employees${query ? `?${query}` : ""}`
  );
}

export async function createEmployee(payload: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  department_id?: number | null;
  outlet_id?: number | null;
  designation: string;
  employment_type: "Full-time" | "Part-time" | "Contract";
  hire_date?: string;
  salary?: number;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/employees",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updateEmployee(
  id: number,
  payload: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    department_id?: number | null;
    outlet_id?: number | null;
    designation: string;
    employment_type: "Full-time" | "Part-time" | "Contract";
    hire_date?: string;
    salary?: number;
  }
) {
  return apiFetch<{ status: string; message: string }>(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteEmployee(id: number) {
  return apiFetch<{ status: string; message: string }>(`/employees/${id}`, {
    method: "DELETE",
  });
}

// ---------- Users & RBAC ----------
export async function getUsers(params?: { role?: string; q?: string }) {
  const qs = new URLSearchParams();
  if (params?.role) qs.set("role", params.role);
  if (params?.q) qs.set("q", params.q);
  const query = qs.toString();
  return apiFetch<{ status: string; data: User[] }>(
    `/users${query ? `?${query}` : ""}`
  );
}

export async function getRolePermissions() {
  return apiFetch<{ status: string; data: RoleMatrix }>("/roles/permissions");
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  outlet_id?: number | null;
  pin_code?: string;
}) {
  return apiFetch<{ status: string; message: string; data: { id: number } }>(
    "/users",
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updateUser(
  id: number,
  payload: Partial<{
    name: string;
    email: string;
    password: string;
    role: string;
    outlet_id: number | null;
    pin_code: string;
    is_active: boolean;
  }>
) {
  return apiFetch<{ status: string; message: string }>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function resetUserPassword(id: number, new_password: string) {
  return apiFetch<{ status: string; message: string }>(
    `/users/${id}/reset-password`,
    { method: "POST", body: JSON.stringify({ new_password }) }
  );
}

export async function deleteUser(id: number) {
  return apiFetch<{ status: string; message: string }>(`/users/${id}`, {
    method: "DELETE",
  });
}
