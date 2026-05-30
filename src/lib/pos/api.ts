// POS — HTTP client (frontend kasir POS)
export const API_BASE = "https://distance-bulge-blot.ngrok-free.dev/api";

const TOKEN_KEY = "gurita-token";

export const auth = {
  get token() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set(t: string) { localStorage.setItem(TOKEN_KEY, t); },
  clear() { localStorage.removeItem(TOKEN_KEY); },
  isAuthed() { return !!this.token; },
};

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  headers.set("ngrok-skip-browser-warning", "true");
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const t = auth.token;
  if (t) headers.set("Authorization", `Bearer ${t}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

const unwrap = <T,>(d: any): T => (d && typeof d === "object" && "data" in d ? d.data : d);
const idStr = (v: any) => String(v);

// ---------- Auth ----------
export async function login(payload: { email: string; password: string }) {
  const d = await api<any>("/login", { method: "POST", body: JSON.stringify(payload) });
  const token = d.token || d.access_token || d?.data?.token;
  if (!token) throw new ApiError(200, "Token tidak ditemukan pada respons login");
  auth.set(token);
  return d.user || d?.data?.user || null;
}
export async function logout() {
  try { await api("/logout", { method: "POST" }); } catch { /* ignore */ }
  auth.clear();
}
export async function forgotPassword(email: string) {
  return api("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

// ---------- Categories ----------
export type ApiCategory = { id: string; name: string };
const mapCategory = (c: any): ApiCategory => ({ id: idStr(c.id), name: c.name });
export const categoriesApi = {
  list: async () => unwrap<any[]>(await api("/categories")).map(mapCategory),
  create: async (name: string) => mapCategory(unwrap(await api("/categories", { method: "POST", body: JSON.stringify({ name }) }))),
  update: async (id: string, name: string) => mapCategory(unwrap(await api(`/categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) }))),
  remove: (id: string) => api(`/categories/${id}`, { method: "DELETE" }),
};

// ---------- Products ----------
export type ApiProduct = {
  id: string; name: string; price: number; unit: string;
  categoryId: string; image: string; stock?: number;
};
const mapProduct = (p: any): ApiProduct => ({
  id: idStr(p.id),
  name: p.name,
  price: Number(p.price) || 0,
  unit: p.unit ?? "tangkai",
  categoryId: idStr(p.category_id ?? p.categoryId ?? ""),
  image: p.image ?? p.image_url ?? "",
});
const productPayload = (p: Partial<ApiProduct>) => ({
  name: p.name, price: p.price, unit: p.unit, category_id: p.categoryId, image: p.image,
});
export const productsApi = {
  list: async () => unwrap<any[]>(await api("/products")).map(mapProduct),
  create: async (p: Omit<ApiProduct, "id">) => mapProduct(unwrap(await api("/products", { method: "POST", body: JSON.stringify(productPayload(p)) }))),
  update: async (id: string, p: Partial<ApiProduct>) => mapProduct(unwrap(await api(`/products/${id}`, { method: "PUT", body: JSON.stringify(productPayload(p)) }))),
  remove: (id: string) => api(`/products/${id}`, { method: "DELETE" }),
};

// ---------- Transactions ----------
export type ApiTransaction = {
  id: string; date: string; customer: string;
  method: "Tunai" | "QRIS";
  items: { name: string; qty: number; price: number; unit: string }[];
  subtotal: number; paid: number; change: number;
  cashier_name?: string;
};
const mapTx = (t: any): ApiTransaction => ({
  id: idStr(t.id),
  date: t.created_at || t.date || new Date().toISOString(),
  customer: t.customer ?? "Pelanggan",
  method: (t.method as any) ?? "Tunai",
  items: (t.items ?? []).map((i: any) => ({ name: i.name, qty: Number(i.qty), price: Number(i.price), unit: i.unit ?? "" })),
  subtotal: Number(t.subtotal ?? 0),
  paid: Number(t.paid ?? 0),
  change: Number(t.change ?? 0),
  cashier_name: t.cashier_name ?? undefined,
});
export const transactionsApi = {
  list: async () => unwrap<any[]>(await api("/transactions")).map(mapTx),
  create: async (t: Omit<ApiTransaction, "id" | "date">) =>
    mapTx(unwrap(await api("/transactions", { method: "POST", body: JSON.stringify(t) }))),
};
