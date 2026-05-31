// POS — data dummy fallback agar tampilan kasir tetap hidup tanpa backend
import type { ApiCategory, ApiProduct, ApiTransaction } from "./api";

export const DUMMY_CATEGORIES: ApiCategory[] = [
  { id: "cat-bunga", name: "Bunga" },
  { id: "cat-wrapping", name: "Wrapping" },
  { id: "cat-aksesoris", name: "Aksesoris" },
];

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=600&q=70`;

export const DUMMY_PRODUCTS: ApiProduct[] = [
  { id: "p-1", name: "Mawar Merah", price: 12000, unit: "tangkai", categoryId: "cat-bunga", image: img("photo-1490750967868-88aa4486c946"), stock: 50 },
  { id: "p-2", name: "Mawar Putih", price: 13000, unit: "tangkai", categoryId: "cat-bunga", image: img("photo-1455659817273-f96807779a8a"), stock: 40 },
  { id: "p-3", name: "Baby Breath", price: 18000, unit: "ikat",   categoryId: "cat-bunga", image: img("photo-1487070183336-b863922373d4"), stock: 25 },
  { id: "p-4", name: "Tulip Pink",  price: 22000, unit: "tangkai", categoryId: "cat-bunga", image: img("photo-1520763185298-1b434c919102"), stock: 18 },
  { id: "p-5", name: "Sunflower",   price: 17000, unit: "tangkai", categoryId: "cat-bunga", image: img("photo-1597848212624-a19eb35e2651"), stock: 22 },
  { id: "p-6", name: "Wrapping Kraft", price: 8000, unit: "lembar", categoryId: "cat-wrapping", image: img("photo-1606293459339-aa5d34a7b0e1"), stock: 100 },
  { id: "p-7", name: "Wrapping Korean", price: 12000, unit: "lembar", categoryId: "cat-wrapping", image: img("photo-1561181286-d3fee7d55364"), stock: 80 },
  { id: "p-8", name: "Pita Satin", price: 5000, unit: "meter", categoryId: "cat-aksesoris", image: img("photo-1513201099705-a9746e1e201f"), stock: 60 },
  { id: "p-9", name: "Kartu Ucapan", price: 3000, unit: "pcs", categoryId: "cat-aksesoris", image: img("photo-1546938576-6e6a64f317cc"), stock: 120 },
];

export const DUMMY_TRANSACTIONS: ApiTransaction[] = [
  {
    id: "tx-1001",
    invoice: "INV-20260531-1001",
    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    customer: "Ayu",
    method: "Tunai",
    status: "Lunas",
    items: [{ name: "Mawar Merah", qty: 10, price: 12000, unit: "tangkai" }],
    subtotal: 120000, paid: 150000, change: 30000,
    cashier_name: "Kasir Demo",
  },
  {
    id: "tx-1002",
    invoice: "INV-20260530-1002",
    date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    customer: "Rian",
    method: "QRIS",
    status: "Lunas",
    items: [
      { name: "Tulip Pink", qty: 5, price: 22000, unit: "tangkai" },
      { name: "Wrapping Korean", qty: 1, price: 12000, unit: "lembar" },
    ],
    subtotal: 122000, paid: 122000, change: 0,
    cashier_name: "Kasir Demo",
  },
];
