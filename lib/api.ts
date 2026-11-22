export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api/v1";

const TOKEN_STORAGE_KEY = "pos_auth_token";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  outlet_id: number | null;
  is_active?: boolean;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  price: string | number;
  cost_price: string | number;
  image_url: string | null;
  category_id: number | null;
  category: string | null;
  stock_on_hand: string | number;
}

export interface LoginResponse {
  status: string;
  user: User;
  token: string;
}

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
    const message =
      payload?.message ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload?.errors);
  }

  return payload as T;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    token: null,
    body: JSON.stringify({ email, password }),
  });
  setStoredToken(data.token);
  return data;
}

export async function getMe(token?: string): Promise<{ status: string; user: User }> {
  return apiFetch<{ status: string; user: User }>("/me", { token });
}

export async function logout(): Promise<void> {
  try {
    await apiFetch<{ status: string; message: string }>("/auth/logout", {
      method: "POST",
    });
  } finally {
    setStoredToken(null);
  }
}

export async function getProducts(
  outletId = 1
): Promise<{ status: string; data: Product[] }> {
  return apiFetch<{ status: string; data: Product[] }>(
    `/products?outlet_id=${outletId}`
  );
}
