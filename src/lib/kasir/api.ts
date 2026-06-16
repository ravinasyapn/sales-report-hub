/**
 * ============================================================================
 * API KASIR — Klien HTTP ke Backend Laravel (Gurita POS)
 * ============================================================================
 * Versi ini sudah DISESUAIKAN dengan backend Laravel Anda:
 *   - Endpoint berbahasa Indonesia: /login, /kategori, /produk, /transaksi
 *   - Nama field sesuai migrasi: nama_produk, harga, id_kategori, dst.
 *   - Format respons backend: { sukses, pesan?, data? }
 *
 * Kontrak ekspor (categoriesApi, productsApi, transactionsApi, types) DIPERTAHANKAN
 * persis seperti semula, sehingga store (penyimpanan.ts) dan halaman POS tidak
 * perlu diubah — kecuali satu baris kecil di pos.index.tsx (lihat panduan).
 * ============================================================================
 */

// Alamat backend. Bisa dioverride lewat .env: VITE_API_BASE=http://127.0.0.1:8000/api
export const API_BASE =
  ((import.meta as any).env?.VITE_API_BASE as string) || "http://127.0.0.1:8000/api";

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
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const t = auth.token;
  if (t) headers.set("Authorization", `Bearer ${t}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    // Backend Laravel mengirim pesan error di `pesan` (kustom) atau `message` (validasi 422)
    const msg = (data && (data.pesan || data.message || data.error)) || `HTTP ${res.status}`;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

// Backend membungkus payload di { sukses, data }. Untuk endpoint list non-paginasi,
// `data` adalah array. Untuk transaksi, `data` adalah objek paginator Laravel.
const unwrap = <T,>(d: any): T => (d && typeof d === "object" && "data" in d ? d.data : d);
const idStr = (v: any) => String(v ?? "");

// ---------- Auth ----------
export type AuthUser = { name: string; email: string; role: "owner" | "kasir" };

export async function login(payload: { email: string; password: string }): Promise<AuthUser | null> {
  const d = await api<any>("/login", { method: "POST", body: JSON.stringify(payload) });
  const token = d.token ?? d.access_token ?? d?.data?.token;
  if (!token) throw new ApiError(200, "Token tidak ditemukan pada respons login");
  auth.set(token);
  const u = d.pengguna ?? d.user ?? d?.data?.pengguna ?? null;
  if (!u) return null;
  return {
    name: u.nama_lengkap ?? u.name ?? "",
    email: u.email ?? "",
    role: (u.peran ?? u.role ?? "kasir") as "owner" | "kasir",
  };
}

export async function logout() {
  try { await api("/logout", { method: "POST" }); } catch { /* abaikan */ }
  auth.clear();
}

export async function forgotPassword(email: string) {
  // Backend belum punya endpoint ini — disediakan agar halaman lupa-password tidak error fatal.
  return api("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

// ---------- Categories (Kategori) ----------
export type ApiCategory = { id: string; name: string };
const mapCategory = (c: any): ApiCategory => ({
  id: idStr(c.id_kategori ?? c.id),
  name: c.nama_kategori ?? c.name ?? "",
});
export const categoriesApi = {
  list: async () => unwrap<any[]>(await api("/kategori")).map(mapCategory),
  create: async (name: string) =>
    mapCategory(unwrap(await api("/kategori", { method: "POST", body: JSON.stringify({ nama_kategori: name }) }))),
  update: async (id: string, name: string) =>
    mapCategory(unwrap(await api(`/kategori/${id}`, { method: "PUT", body: JSON.stringify({ nama_kategori: name }) }))),
  remove: (id: string) => api(`/kategori/${id}`, { method: "DELETE" }),
};

// ---------- Products (Produk) ----------
export type ApiProduct = {
  id: string; name: string; price: number; unit: string;
  categoryId: string; image: string; stock?: number;
};
const mapProduct = (p: any): ApiProduct => ({
  id: idStr(p.id_produk ?? p.id),
  name: p.nama_produk ?? p.name ?? "",
  price: Number(p.harga ?? p.price) || 0,
  unit: p.satuan ?? p.unit ?? "tangkai",
  categoryId: idStr(p.id_kategori ?? p.categoryId ?? ""),
  image: p.url_gambar ?? p.image ?? "",
  stock: Number(p.stok ?? p.stock ?? 0),
});
const produkPayload = (p: Partial<ApiProduct>) => ({
  id_kategori: p.categoryId != null && p.categoryId !== "" ? Number(p.categoryId) : undefined,
  nama_produk: p.name,
  harga: p.price,
  satuan: p.unit,
  url_gambar: p.image,
  stok: p.stock,
});
export const productsApi = {
  list: async () => unwrap<any[]>(await api("/produk")).map(mapProduct),
  create: async (p: Omit<ApiProduct, "id">) =>
    mapProduct(unwrap(await api("/produk", { method: "POST", body: JSON.stringify(produkPayload(p)) }))),
  update: async (id: string, p: Partial<ApiProduct>) =>
    mapProduct(unwrap(await api(`/produk/${id}`, { method: "PUT", body: JSON.stringify(produkPayload(p)) }))),
  remove: (id: string) => api(`/produk/${id}`, { method: "DELETE" }),
};

// ---------- Transactions (Transaksi) ----------
export type TxStatus = "Lunas" | "Pending" | "Dibatalkan";
export type ApiTransaction = {
    id: string; invoice: string; date: string; customer: string;

  method: "Tunai" | "QRIS";
  status: TxStatus;
  // `productId` opsional: bila ada, backend memotong stok produk asli.
  items: { name: string; qty: number; price: number; unit: string; productId?: string }[];
  subtotal: number; paid: number; change: number;
  cashier_name?: string;
};
const makeInvoice = (id: string, date: string) => {
  const d = new Date(date);
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const tail = String(id).replace(/\D/g, "").slice(-4).padStart(4, "0") || String(id).slice(-4).toUpperCase();
  return `INV-${ymd}-${tail}`;
};
const mapTx = (t: any): ApiTransaction => {
  const id = idStr(t.id);
  const date = t.created_at || t.date || new Date().toISOString();
  const paid = Number(t.paid ?? 0);
  const subtotal = Number(t.subtotal ?? 0);
  const status: TxStatus = t.status ?? (paid >= subtotal && subtotal > 0 ? "Lunas" : "Pending");
  return {
    id,
    invoice: t.invoice ?? makeInvoice(id, date),
    date,
    customer: t.customer ?? "Pelanggan",
    method: (t.method as any) ?? "Tunai",
    status,
    items: (t.items ?? []).map((i: any) => ({ name: i.name, qty: Number(i.qty), price: Number(i.price), unit: i.unit ?? "" })),
    subtotal,
    paid,
    change: Number(t.change ?? 0),
    cashier_name: t.cashier_name ?? undefined,
  };
};
export const transactionsApi = {
  list: async () => {
    const d = await api<any>("/transaksi");
    // /transaksi mengembalikan paginator Laravel: { data: { data: [...] } }
    const arr = d?.data?.data ?? d?.data ?? [];
    return (Array.isArray(arr) ? arr : []).map(mapTx);
  },
  create: async (t: Omit<ApiTransaction, "id" | "date">) => {
    const payload = {
      nama_pelanggan: t.customer || "Pelanggan",
      metode_bayar: t.method,
      diskon: 0,
      uang_diterima: t.method === "Tunai" ? t.paid : t.subtotal,
      items: t.items.map((i) =>
        i.productId
          ? { id_produk: Number(i.productId), jumlah: i.qty }
          : { nama_produk: i.name, harga_satuan: i.price, satuan: i.unit, jumlah: i.qty }
      ),
    };
    const tx = mapTx(unwrap(await api("/transaksi", { method: "POST", body: JSON.stringify(payload) })));
    // Backend tidak mengembalikan nama kasir di response create → pakai yang dikirim frontend.
    if (!tx.cashier_name && t.cashier_name) tx.cashier_name = t.cashier_name;
    return tx;
  },
};

// ---------- Pengguna (Manajemen Akun) — owner only ----------
export type ApiUser = {
  id: string; name: string; email: string; phone: string | null;
  role: "owner" | "kasir"; status: "aktif" | "nonaktif";
  created_at?: string;
};
const mapUser = (u: any): ApiUser => ({
  id: idStr(u.id_pengguna ?? u.id),
  name: u.nama_lengkap ?? u.name ?? "",
  email: u.email ?? "",
  phone: u.no_telepon ?? u.phone ?? null,
  role: (u.peran ?? u.role ?? "kasir") as "owner" | "kasir",
  status: (u.status ?? "aktif") as "aktif" | "nonaktif",
  created_at: u.created_at ?? undefined,
});
export const penggunaApi = {
  list: async () => unwrap<any[]>(await api("/pengguna")).map(mapUser),
  create: async (p: { name: string; email: string; phone?: string; password: string; role?: "owner" | "kasir" }) =>
    mapUser(unwrap(await api("/pengguna", {
      method: "POST",
      body: JSON.stringify({
        nama_lengkap: p.name,
        email: p.email,
        no_telepon: p.phone || null,
        password: p.password,
        peran: p.role ?? "kasir",
        status: "aktif",
      }),
    }))),
  update: async (id: string, p: Partial<{ name: string; email: string; phone: string; password: string; role: "owner" | "kasir"; status: "aktif" | "nonaktif" }>) =>
    mapUser(unwrap(await api(`/pengguna/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        nama_lengkap: p.name,
        email: p.email,
        no_telepon: p.phone,
        password: p.password,
        peran: p.role,
        status: p.status,
      }),
    }))),
  remove: (id: string) => api(`/pengguna/${id}`, { method: "DELETE" }),
};

// ---------- Pengaturan Toko ----------
export type ApiSettings = { event_name: string; owner_address: string; owner_phone: string };
const mapSettings = (s: any): ApiSettings => ({
  event_name: s.nama_event ?? s.event_name ?? "",
  owner_address: s.alamat_owner ?? s.owner_address ?? "",
  owner_phone: s.no_telepon_owner ?? s.owner_phone ?? "",
});
export const pengaturanApi = {
  get: async () => mapSettings(unwrap(await api("/pengaturan"))),
  update: async (s: ApiSettings) =>
    mapSettings(unwrap(await api("/pengaturan", {
      method: "PUT",
      body: JSON.stringify({
        nama_event: s.event_name,
        alamat_owner: s.owner_address,
        no_telepon_owner: s.owner_phone,
      }),
    }))),
};

// ---------- Laporan / Dashboard ----------
export type DashboardData = {
  omzet_hari_ini: number;
  jumlah_transaksi: number;
  omzet_tunai: number;
  omzet_qris: number;
  produk_stok_menipis: { id_produk: number; nama_produk: string; stok: number; stok_minimum: number }[];
};
export type PenjualanData = {
  periode: { dari: string; sampai: string };
  total_omzet: number;
  total_transaksi: number;
  per_hari: { tanggal: string; jumlah: number; omzet: number }[];
  produk_terlaris: { nama_produk: string; total_terjual: number; total_omzet: number }[];
};
export type KasirOnlineData = {
  ambang_menit: number;
  jumlah: number;
  kasir: { id_pengguna: number; nama_lengkap: string; peran: string; terakhir_pakai: string }[];
};
export const laporanApi = {
  dashboard: async () => unwrap<DashboardData>(await api("/laporan/dashboard")),
  penjualan: async (params?: { dari?: string; sampai?: string }) => {
    const qs = new URLSearchParams();
    if (params?.dari) qs.set("dari", params.dari);
    if (params?.sampai) qs.set("sampai", params.sampai);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return unwrap<PenjualanData>(await api(`/laporan/penjualan${suffix}`));
  },
  kasirOnline: async () => unwrap<KasirOnlineData>(await api("/laporan/kasir-online")),
};
