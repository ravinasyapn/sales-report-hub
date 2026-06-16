/**
 * ============================================================================
 * PENYIMPANAN (STORE) — State Global Aplikasi Kasir
 * ============================================================================
 * Reactive store sederhana berbasis `useSyncExternalStore` (built-in React).
 * Menyimpan: daftar kategori, produk, transaksi, pengaturan, dan keranjang.
 *
 * - `useStore()`     → hook React untuk membaca state (rerender otomatis)
 * - `actions`        → semua aksi mutasi data (sync, tambah, edit, hapus)
 * - `useCart()` +    → keranjang kasir sebelum transaksi disimpan
 *   `cartActions`
 * - `getCurrentUser`, `isOwner`, `formatIDR` → helper kecil
 *
 * FALLBACK: jika backend tidak merespons / kosong, aplikasi otomatis memakai
 * data contoh dari `src/lib/mock/data-contoh.ts` (flag `usingDummy`).
 * ============================================================================
 */
import { useSyncExternalStore } from "react";
import {
  categoriesApi, productsApi, transactionsApi,
  type ApiCategory, type ApiProduct, type ApiTransaction,
} from "./api";
import { DUMMY_CATEGORIES, DUMMY_PRODUCTS, DUMMY_TRANSACTIONS } from "@/lib/mock/data-contoh";
// Sinkron dengan pengaturan admin (event_name / owner_address / owner_phone)
import { SETTINGS_KEY as ADMIN_SETTINGS_KEY, SETTINGS_EVENT as ADMIN_SETTINGS_EVENT } from "@/hooks/use-app-settings";

export type Category = ApiCategory;
export type Product = ApiProduct;
export type Transaction = ApiTransaction;
export type CartItem = { productId: string; qty: number };
export type Settings = {
  shopName: string;
  address: string;
  phone: string;
  taxPercent: number;
};

type Store = {
  categories: Category[];
  products: Product[];
  transactions: Transaction[];
  settings: Settings;
  loaded: boolean;
  loading: boolean;
  error: string | null;
  usingDummy: boolean;
};

const DEFAULT_SETTINGS: Settings = { shopName: "Gurita Bouquet", address: "", phone: "", taxPercent: 0 };

function readAdminSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const a = JSON.parse(raw);
    return {
      shopName: a.event_name || DEFAULT_SETTINGS.shopName,
      address: a.owner_address || "",
      phone: a.owner_phone || "",
      taxPercent: 0,
    };
  } catch { return DEFAULT_SETTINGS; }
}

let store: Store = {
  categories: [], products: [], transactions: [],
  settings: readAdminSettings(),
  loaded: false, loading: false, error: null, usingDummy: false,
};

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

export function useStore(): Store {
  return useSyncExternalStore(subscribe, () => store, () => store);
}

// Refresh settings ketika admin menyimpan
if (typeof window !== "undefined") {
  const refresh = () => { store = { ...store, settings: readAdminSettings() }; emit(); };
  window.addEventListener(ADMIN_SETTINGS_EVENT, refresh);
  window.addEventListener("storage", (e) => { if (e.key === ADMIN_SETTINGS_KEY) refresh(); });
}

export const actions = {
  async syncAll() {
    if (store.loading) return;
    store = { ...store, loading: true, error: null };
    emit();
    try {
      const [categories, products, transactions] = await Promise.all([
        categoriesApi.list().catch(() => [] as Category[]),
        productsApi.list().catch(() => [] as Product[]),
        transactionsApi.list().catch(() => [] as Transaction[]),
      ]);
      // Fallback ke dummy bila backend tidak menyediakan data
      const useDummy = categories.length === 0 && products.length === 0;
      store = {
        ...store,
        categories: useDummy ? DUMMY_CATEGORIES : categories,
        products:   useDummy ? DUMMY_PRODUCTS   : products,
        transactions: useDummy ? DUMMY_TRANSACTIONS : transactions,
        loaded: true, loading: false, usingDummy: useDummy,
      };
    } catch (e: any) {
      // Total error → tetap tampilkan dummy supaya tampilan tidak kosong
      store = {
        ...store,
        categories: DUMMY_CATEGORIES, products: DUMMY_PRODUCTS, transactions: DUMMY_TRANSACTIONS,
        loaded: true, loading: false, usingDummy: true,
        error: e?.message ?? "Gagal memuat data — menggunakan data contoh.",
      };
    }
    emit();
  },

  async addCategory(name: string) {
    if (store.usingDummy) {
      const c = { id: `cat-${Date.now()}`, name };
      store = { ...store, categories: [...store.categories, c] }; emit(); return;
    }
    const c = await categoriesApi.create(name);
    store = { ...store, categories: [...store.categories, c] }; emit();
  },
  async updateCategory(id: string, name: string) {
    if (store.usingDummy) {
      store = { ...store, categories: store.categories.map((x) => x.id === id ? { ...x, name } : x) };
      emit(); return;
    }
    const c = await categoriesApi.update(id, name);
    store = { ...store, categories: store.categories.map((x) => (x.id === id ? c : x)) }; emit();
  },
  async deleteCategory(id: string) {
    if (!store.usingDummy) await categoriesApi.remove(id);
    store = {
      ...store,
      categories: store.categories.filter((c) => c.id !== id),
      products: store.products.filter((p) => p.categoryId !== id),
    };
    emit();
  },

  async addProduct(p: Omit<Product, "id">) {
    if (store.usingDummy) {
      const np = { ...p, id: `p-${Date.now()}` } as Product;
      store = { ...store, products: [...store.products, np] }; emit(); return;
    }
    const np = await productsApi.create(p);
    store = { ...store, products: [...store.products, np] }; emit();
  },
  async updateProduct(id: string, patch: Partial<Product>) {
    if (store.usingDummy) {
      store = { ...store, products: store.products.map((x) => x.id === id ? { ...x, ...patch } as Product : x) };
      emit(); return;
    }
    const existing = store.products.find((x) => x.id === id);
    const merged = { ...existing, ...patch } as Product;
    const np = await productsApi.update(id, merged);
    store = { ...store, products: store.products.map((x) => (x.id === id ? np : x)) }; emit();
  },
  async deleteProduct(id: string) {
    if (!store.usingDummy) await productsApi.remove(id);
    store = { ...store, products: store.products.filter((p) => p.id !== id) }; emit();
  },

  async addTransaction(t: Omit<Transaction, "id" | "date" | "invoice" | "status"> & { status?: Transaction["status"] }) {
    let tx: Transaction;
    if (store.usingDummy) {
      const id = `tx-${Date.now()}`;
      const date = new Date().toISOString();
      const status = t.status ?? (t.paid >= t.subtotal ? "Lunas" : "Pending");
      const d = new Date(date);
      const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
      const invoice = `INV-${ymd}-${String(Date.now()).slice(-4)}`;
      tx = { ...t, id, date, invoice, status } as Transaction;
    } else {
      tx = await transactionsApi.create(t as any);
    }
    const products = store.products.map((p) => {
      const item = t.items.find((i) => i.name === p.name);
      return item ? { ...p, stock: Math.max(0, (p.stock ?? 0) - item.qty) } : p;
    });
    store = { ...store, transactions: [tx, ...store.transactions], products };
    emit();
    return tx;
  },

  async reset() {
    store = { ...store, categories: [], products: [], transactions: [], loaded: false };
    emit();
    await this.syncAll();
  },
};

// Cart (in-memory)
type Cart = CartItem[];
let cart: Cart = [];
const cartListeners = new Set<() => void>();
function cartPersist() { cartListeners.forEach((l) => l()); }
export function useCart(): Cart {
  return useSyncExternalStore(
    (cb) => { cartListeners.add(cb); return () => cartListeners.delete(cb); },
    () => cart, () => [],
  );
}
export const cartActions = {
  add(productId: string) {
    const found = cart.find((c) => c.productId === productId);
    cart = found
      ? cart.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c))
      : [...cart, { productId, qty: 1 }];
    cartPersist();
  },
  setQty(productId: string, qty: number) {
    cart = qty <= 0
      ? cart.filter((c) => c.productId !== productId)
      : cart.map((c) => (c.productId === productId ? { ...c, qty } : c));
    cartPersist();
  },
  remove(productId: string) { cart = cart.filter((c) => c.productId !== productId); cartPersist(); },
  clear() { cart = []; cartPersist(); },
};

// Helper role dari localStorage user-data (diset saat login)
export function getCurrentUser(): { name?: string; email?: string; role?: string } {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("user-data") || "{}"); } catch { return {}; }
}
export function isOwner() { return getCurrentUser().role === "owner"; }

export const formatIDR = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
