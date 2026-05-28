import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, ShoppingCart, Trash2, User, Banknote, QrCode,
  Plus, Minus, Store, CheckCircle2, Printer, X, Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Point of Sale — Gurita Bouquet" }] }),
  component: PosPage,
});

type Category = "bunga" | "wrapping";
type Product = { id: string; name: string; price: number; unit: string; category: Category; img: string };

const PRODUCTS: Product[] = [
  { id: "1",  name: "Mawar Merah",   price: 15000, unit: "per tangkai", category: "bunga",    img: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400" },
  { id: "2",  name: "Mawar Pink",    price: 15000, unit: "per tangkai", category: "bunga",    img: "https://images.unsplash.com/photo-1454425064867-9f5acab7c4f9?w=400" },
  { id: "3",  name: "Aster Ungu",    price: 15000, unit: "per tangkai", category: "bunga",    img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400" },
  { id: "4",  name: "Daisy Pink",    price: 15000, unit: "per tangkai", category: "bunga",    img: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400" },
  { id: "5",  name: "Tulip Pink",    price: 18000, unit: "per tangkai", category: "bunga",    img: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=400" },
  { id: "6",  name: "Lily Putih",    price: 20000, unit: "per tangkai", category: "bunga",    img: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=400" },
  { id: "7",  name: "Carnation",     price: 12000, unit: "per tangkai", category: "bunga",    img: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400" },
  { id: "8",  name: "Baby Breath",   price: 10000, unit: "per ikat",    category: "bunga",    img: "https://images.unsplash.com/photo-1561569533-c5a3a8b59d70?w=400" },
  { id: "9",  name: "Wrap Kraft",    price:  8000, unit: "per lembar",  category: "wrapping", img: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400" },
  { id: "10", name: "Wrap Pink",     price:  9000, unit: "per lembar",  category: "wrapping", img: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=400" },
  { id: "11", name: "Pita Satin",    price:  5000, unit: "per meter",   category: "wrapping", img: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400" },
  { id: "12", name: "Wrap Korean",   price: 11000, unit: "per lembar",  category: "wrapping", img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400" },
];

type CartItem = Product & { qty: number };

type Receipt = {
  receipt_no: string;
  customer_name: string;
  payment_method: "tunai" | "qris";
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  created_at: string;
  items: { product_name: string; qty: number; price: number; subtotal: number; unit: string }[];
};

function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function PosPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState("");
  const [method, setMethod] = useState<"tunai" | "qris">("tunai");
  const [paid, setPaid] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (filter === "all" || p.category === filter) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, filter],
  );

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const paidNum = method === "qris" ? total : Number(paid) || 0;
  const change = Math.max(0, paidNum - total);

  const addToCart = (p: Product) =>
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      return ex ? c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)) : [...c, { ...p, qty: 1 }];
    });

  const setQty = (id: string, delta: number) =>
    setCart((c) =>
      c.flatMap((i) => {
        if (i.id !== id) return [i];
        const q = i.qty + delta;
        return q <= 0 ? [] : [{ ...i, qty: q }];
      }),
    );

  const remove = (id: string) => setCart((c) => c.filter((i) => i.id !== id));

  const canPay =
    cart.length > 0 && customer.trim() !== "" && (method === "qris" || paidNum >= total) && !saving;

  const process = async () => {
    if (!canPay) return;
    setSaving(true);
    setError(null);
    try {
      const { data: tx, error: txErr } = await supabase
        .from("transactions")
        .insert({
          customer_name: customer.trim(),
          payment_method: method,
          total_amount: total,
          paid_amount: paidNum,
          change_amount: change,
        })
        .select()
        .single();

      if (txErr) throw txErr;

      const items = cart.map((i) => ({
        transaction_id: tx.id,
        product_id: i.id,
        product_name: i.name,
        product_image: i.img,
        unit: i.unit,
        category: i.category,
        price: i.price,
        qty: i.qty,
        subtotal: i.price * i.qty,
      }));

      const { error: itErr } = await supabase.from("transaction_items").insert(items);
      if (itErr) throw itErr;

      setReceipt({
        receipt_no: tx.receipt_no,
        customer_name: tx.customer_name,
        payment_method: tx.payment_method as "tunai" | "qris",
        total_amount: Number(tx.total_amount),
        paid_amount: Number(tx.paid_amount),
        change_amount: Number(tx.change_amount),
        created_at: tx.created_at,
        items: cart.map((i) => ({
          product_name: i.name,
          qty: i.qty,
          price: i.price,
          subtotal: i.price * i.qty,
          unit: i.unit,
        })),
      });

      setCart([]);
      setCustomer("");
      setPaid("");
    } catch (e: any) {
      setError(e.message ?? "Gagal menyimpan transaksi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] min-h-screen">
      {/* Product area */}
      <section className="p-6">
        <header className="mb-5">
          <div className="flex items-center gap-3">
            <Store className="w-7 h-7 text-accent" />
            <div>
              <h1 className="text-2xl font-extrabold text-accent">Point of Sale</h1>
              <p className="text-sm text-muted-foreground">Pilih produk untuk ditambahkan ke keranjang</p>
            </div>
          </div>

          <div className="relative mt-4 max-w-md">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari bunga atau wrapping..."
              className="w-full rounded-full bg-card border border-border pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex gap-2 mt-3">
            {(["all", "bunga", "wrapping"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition ${
                  filter === c
                    ? "bg-accent text-accent-foreground"
                    : "bg-card text-accent hover:bg-secondary"
                }`}
              >
                {c === "all" ? "Semua Produk" : c}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-card rounded-2xl overflow-hidden text-left hover:scale-[1.02] hover:shadow-lg transition group"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-3 text-center">
                <p className="font-semibold text-accent text-sm">{p.name}</p>
                <p className="text-primary font-bold text-sm mt-1">{rupiah(p.price)}</p>
                <p className="text-xs text-muted-foreground">{p.unit}</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-10">
              Produk tidak ditemukan.
            </p>
          )}
        </div>
      </section>

      {/* Cart panel */}
      <aside className="bg-primary/90 text-accent flex flex-col">
        <header className="p-5 bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-accent" />
            <div>
              <h2 className="font-extrabold text-accent">Keranjang Belanja</h2>
              <p className="text-xs text-muted-foreground">{cart.length} item dipilih</p>
            </div>
          </div>
          <span className="bg-secondary text-accent rounded-full px-3 py-1 text-sm font-bold">
            {cart.reduce((s, i) => s + i.qty, 0)}
          </span>
        </header>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 && (
            <p className="text-center text-accent/70 py-8 text-sm">Keranjang masih kosong.</p>
          )}
          {cart.map((i) => (
            <div key={i.id} className="bg-card rounded-2xl p-3 flex gap-3 text-accent">
              <img src={i.img} alt={i.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{i.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {rupiah(i.price)} / {i.unit.replace("per ", "")}
                    </p>
                  </div>
                  <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
                    <button onClick={() => setQty(i.id, -1)} className="w-6 h-6 rounded-full bg-card flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-sm font-bold">{i.qty}</span>
                    <button onClick={() => setQty(i.id, +1)} className="w-6 h-6 rounded-full bg-card flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-bold text-primary text-sm">{rupiah(i.price * i.qty)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary p-5 space-y-4 text-accent">
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold mb-1.5">
              <User className="w-3.5 h-3.5" /> Nama Pelanggan
            </label>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Masukkan nama pelanggan"
              className="w-full rounded-full bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div>
            <p className="text-xs font-semibold mb-1.5">Metode Pembayaran</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMethod("tunai")}
                className={`flex flex-col items-center gap-1 py-4 rounded-2xl font-bold transition ${
                  method === "tunai" ? "bg-accent text-accent-foreground" : "bg-card text-accent hover:bg-secondary"
                }`}
              >
                <Banknote className="w-6 h-6" /> Tunai
              </button>
              <button
                onClick={() => setMethod("qris")}
                className={`flex flex-col items-center gap-1 py-4 rounded-2xl font-bold transition ${
                  method === "qris" ? "bg-accent text-accent-foreground" : "bg-card text-accent hover:bg-secondary"
                }`}
              >
                <QrCode className="w-6 h-6" /> QRIS
              </button>
            </div>
          </div>

          {method === "tunai" && (
            <div>
              <label className="text-xs font-semibold mb-1.5 block">Uang Diterima</label>
              <input
                type="number"
                value={paid}
                onChange={(e) => setPaid(e.target.value)}
                placeholder="Masukkan jumlah uang"
                className="w-full rounded-full bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
              />
              {paidNum >= total && total > 0 && (
                <p className="text-xs mt-2 text-card">Kembalian: <b>{rupiah(change)}</b></p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-accent/20">
            <span className="font-bold">Total Tagihan</span>
            <span className="text-xl font-extrabold">{rupiah(total)}</span>
          </div>

          {error && <p className="text-xs text-destructive bg-card rounded-lg p-2">{error}</p>}

          <button
            disabled={!canPay}
            onClick={process}
            className="w-full rounded-full bg-card py-3 font-bold text-accent disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary transition flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Proses Pembayaran"}
          </button>
        </div>
      </aside>

      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function ReceiptModal({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  const date = new Date(receipt.created_at);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:bg-white print:p-0">
      <div className="bg-card rounded-2xl max-w-sm w-full max-h-[90vh] overflow-auto shadow-2xl print:shadow-none print:rounded-none print:max-w-none">
        <div className="p-5 border-b border-border flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-accent">Pembayaran Berhasil</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-accent">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="receipt-body" className="p-6 text-accent text-sm">
          <div className="text-center mb-4">
            <h3 className="text-lg font-extrabold tracking-wide">GURITA BOUQUET</h3>
            <p className="text-xs text-muted-foreground">Struk Pembayaran Digital</p>
          </div>

          <div className="text-xs space-y-1 border-y border-dashed border-border py-3 mb-3">
            <div className="flex justify-between"><span>No. Struk</span><span className="font-mono">{receipt.receipt_no}</span></div>
            <div className="flex justify-between"><span>Tanggal</span><span>{date.toLocaleString("id-ID")}</span></div>
            <div className="flex justify-between"><span>Pelanggan</span><span>{receipt.customer_name}</span></div>
            <div className="flex justify-between"><span>Metode</span><span className="uppercase">{receipt.payment_method}</span></div>
          </div>

          <div className="space-y-2 mb-3">
            {receipt.items.map((it, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between font-semibold">
                  <span>{it.product_name}</span>
                  <span>{rupiah(it.subtotal)}</span>
                </div>
                <div className="text-muted-foreground">
                  {it.qty} × {rupiah(it.price)} {it.unit}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-border pt-3 space-y-1 text-xs">
            <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>{rupiah(receipt.total_amount)}</span></div>
            <div className="flex justify-between"><span>Dibayar</span><span>{rupiah(receipt.paid_amount)}</span></div>
            <div className="flex justify-between"><span>Kembalian</span><span>{rupiah(receipt.change_amount)}</span></div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5">Terima kasih telah berbelanja 🌸</p>
        </div>

        <div className="p-4 border-t border-border flex gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-full bg-accent text-accent-foreground py-2.5 font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90"
          >
            <Printer className="w-4 h-4" /> Cetak Struk
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-secondary text-accent py-2.5 font-semibold text-sm hover:opacity-90"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
