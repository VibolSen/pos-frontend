export type UserRole =
  | "super_admin"
  | "admin"
  | "outlet_manager"
  | "supervisor"
  | "cashier"
  | "inventory_clerk"
  | "accountant"
  | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  outlet_id: number | null;
  outlet_name?: string | null;
  is_active?: boolean;
  created_at?: string;
}

export interface RoleMatrix {
  [role: string]: {
    name: string;
    capabilities: string[];
  };
}

export interface Outlet {
  id: number;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  is_active: boolean | number;
  staff_count?: number;
  registers_count?: number;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  barcode?: string | null;
  description: string | null;
  price: string | number;
  selling_price?: string | number;
  cost_price: string | number;
  image_url: string | null;
  category_id: number | null;
  category?: string | null;
  category_name?: string | null;
  stock_on_hand?: string | number;
  min_reorder_point?: number;
  expiry_date?: string | null;
  is_active?: boolean | number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  parent_name?: string | null;
  products_count?: number;
  created_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  is_active: boolean | number;
  products_count?: number;
  created_at?: string;
}

export interface Shift {
  id: number;
  outlet_id: number;
  register_id: number;
  user_id: number;
  opened_at: string;
  closed_at: string | null;
  opening_float: string | number;
  expected_cash: string | number;
  counted_cash: string | number | null;
  cash_variance: string | number | null;
  status: "open" | "closed";
  closing_note: string | null;
}

export interface ShiftSummary {
  opening_float: number;
  cash_sales: number;
  cash_in: number;
  cash_out: number;
  expected_cash: number;
}

export interface ActiveShiftData {
  shift: Shift;
  summary: ShiftSummary;
}

export interface HeldCartItem {
  product_id: number;
  name: string;
  price: number;
  qty: number;
}

export interface HeldCart {
  id: string;
  user_name: string;
  customer_name: string;
  note: string;
  items: HeldCartItem[];
  total_items: number;
  held_at: string;
}

export interface SaleLine {
  product_id: number;
  variant_id?: number | null;
  product_name: string;
  unit_price: string | number;
  quantity: string | number;
  discount_amount: string | number;
  subtotal: string | number;
}

export interface Sale {
  id: number;
  outlet_id: number;
  register_id: number;
  shift_id: number | null;
  user_id: number;
  receipt_number: string;
  idempotency_key: string;
  subtotal: string | number;
  tax_total: string | number;
  discount_total: string | number;
  grand_total: string | number;
  currency: string;
  status: string;
  created_at: string;
}

export interface CheckoutResponse {
  sale: Sale;
  lines: SaleLine[];
  is_duplicate: boolean;
}

export interface InventoryBalance {
  balance_id: number;
  outlet_id: number;
  outlet_name: string;
  product_id: number;
  product_name: string;
  sku: string;
  barcode: string | null;
  price: string | number;
  cost_price: string | number;
  image: string | null;
  min_reorder_point: number;
  category_name: string | null;
  on_hand: string | number;
  reserved: string | number;
  available: string | number;
  is_low_stock: number;
}

export interface InventoryMovement {
  id: number;
  outlet_id: number;
  outlet_name: string;
  product_id: number;
  product_name: string;
  sku: string;
  movement_type: string;
  quantity: string | number;
  unit_cost: string | number | null;
  reference_type: string | null;
  reference_id: number | string | null;
  notes: string | null;
  user_name: string | null;
  created_at: string;
}

export interface ExpiredProduct {
  product_id: number;
  product_name: string;
  sku: string;
  barcode: string | null;
  price: string | number;
  cost_price: string | number;
  image: string | null;
  expiry_date: string;
  category_name: string | null;
  on_hand: string | number;
  days_left: number;
  status: "expired" | "expiring_soon";
}

export interface Customer {
  id: number;
  name: string;
  code: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  loyalty_points: number;
  total_spent: string | number;
  is_active: boolean | number;
  created_at?: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean | number;
  created_at?: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string | null;
  employees_count?: number;
  created_at?: string;
}

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  designation: string;
  employment_type: string;
  hire_date: string | null;
  salary: string | number;
  is_active: boolean | number;
  department_id: number | null;
  department_name: string | null;
  outlet_id: number | null;
  outlet_name: string | null;
  created_at?: string;
}

export interface DashboardSummary {
  metrics: {
    total_sales: number;
    total_sales_change: string;
    total_sales_return: number;
    total_sales_return_change: string;
    total_purchase: number;
    total_purchase_change: string;
    total_purchase_return: number;
    total_purchase_return_change: string;
    profit: number;
    profit_change: string;
    invoice_due: number;
    invoice_due_change: string;
    total_expenses: number;
    total_expenses_change: string;
    total_payment_returns: number;
    total_payment_returns_change: string;
  };
  counts: {
    low_stock: number;
    suppliers: number;
    customers: number;
    orders: number;
  };
}

export interface DashboardWidgets {
  top_selling: Array<{
    id: number;
    name: string;
    sku?: string;
    price: number | string;
    sales_count: number | string;
    total_revenue?: number | string;
    change?: string;
  }>;
  low_stock: Array<{
    id: number;
    name: string;
    sku: string;
    in_stock: number | string;
  }>;
  recent_sales: Array<{
    id: number;
    receipt_number?: string;
    date?: string;
    customer: string;
    grand_total?: number | string;
    total?: number | string;
    status: string;
    created_at?: string;
  }>;
  top_customers: Array<{
    name: string;
    country: string;
    orders: number;
    spent: number;
  }>;
}

export interface DashboardCharts {
  sales_purchases: Array<{ month: string; purchases: number; sales: number }>;
  sales_statics: Array<{ month: string; revenue: number; expense: number }>;
  top_categories: Array<{ name: string; percentage: number; sales: number }>;
}
