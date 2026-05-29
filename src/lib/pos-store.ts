// API-backed data store with reactive state
import { useSyncExternalStore } from "react";
import {
  categoriesApi,
  productsApi,
  transactionsApi,
  type ApiCategory,
  type ApiProduct,
  type ApiTransaction,
} from "./pos-api";

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
};

const SETTINGS_KEY = "gurita-settings-v1";

const DEFAULT_SETTINGS: Settings = {
  shopName: "",
  address: "",
  phone: "",
  taxPercent: 0,
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

let store: Store = {
  categories: [],
  products: [],
  transactions: [],
  settings: loadSettings(),
  loaded: false,
  loading: false,
  error: null,
};

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); }

export function useStore(): Store {
  return useSyncExternalStore(subscribe, () => store, () => store);
}

export const actions = {
  async syncAll() {
    if (store.loading) return;
    store = { ...store, loading: true, error: null };
    emit();
    try {
      const [categories, products, transactions] = await Promise.all([
        categoriesApi.list().catch(() => store.categories),
        productsApi.list().catch(() => store.products),
        transactionsApi.list().catch(() => store.transactions),
      ]);
      store = { ...store, categories, products, transactions, loaded: true, loading: false };
    } catch (e: any) {
      store = { ...store, loading: false, error: e?.message ?? "Gagal memuat data" };
    }
    emit();
  },

  async addCategory(name: string) {
    const c = await categoriesApi.create(name);
    store = { ...store, categories: [...store.categories, c] };
    emit();
  },
  async updateCategory(id: string, name: string) {
    const c = await categoriesApi.update(id, name);
    store = { ...store, categories: store.categories.map((x) => (x.id === id ? c : x)) };
    emit();
  },
  async deleteCategory(id: string) {
    await categoriesApi.remove(id);
    store = {
      ...store,
      categories: store.categories.filter((c) => c.id !== id),
      products: store.products.filter((p) => p.categoryId !== id),
    };
    emit();
  },

  async addProduct(p: Omit<Product, "id">) {
    const np = await productsApi.create(p);
    store = { ...store, products: [...store.products, np] };
    emit();
  },
  async updateProduct(id: string, patch: Partial<Product>) {
    const existing = store.products.find((x) => x.id === id);
    const merged = { ...existing, ...patch } as Product;
    const np = await productsApi.update(id, merged);
    store = { ...store, products: store.products.map((x) => (x.id === id ? np : x)) };
    emit();
  },
  async deleteProduct(id: string) {
    await productsApi.remove(id);
    store = { ...store, products: store.products.filter((p) => p.id !== id) };
    emit();
  },

  async addTransaction(t: Omit<Transaction, "id" | "date">) {
    const tx = await transactionsApi.create(t);
    const products = store.products.map((p) => {
      const item = t.items.find((i) => i.name === p.name);
      return item ? { ...p, stock: Math.max(0, (p.stock ?? 0) - item.qty) } : p;
    });
    store = { ...store, transactions: [tx, ...store.transactions], products };
    emit();
    return tx;
  },

  updateSettings(patch: Partial<Settings>) {
    store = { ...store, settings: { ...store.settings, ...patch } };
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(store.settings));
    }
    emit();
  },
  async reset() {
    store = { ...store, categories: [], products: [], transactions: [], loaded: false };
    emit();
    await this.syncAll();
  },
};

// Cart state (in-memory only, per session)
type Cart = CartItem[];
let cart: Cart = [];
const cartListeners = new Set<() => void>();
function cartPersist() { cartListeners.forEach((l) => l()); }
export function useCart(): Cart {
  return useSyncExternalStore(
    (cb) => { cartListeners.add(cb); return () => cartListeners.delete(cb); },
    () => cart,
    () => [],
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
  remove(productId: string) {
    cart = cart.filter((c) => c.productId !== productId);
    cartPersist();
  },
  clear() { cart = []; cartPersist(); },
};

export const formatIDR = (n: number) =>
  "Rp " + Math.round(n).toLocaleString("id-ID");
