import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PosShell } from "@/components/kasir/CangkangKasir";
import { useStore, useCart, cartActions, actions, formatIDR, type Transaction } from "@/lib/kasir";
import { ShoppingCart, Trash2, User, Search, Receipt } from "lucide-react";

export const Route = createFileRoute("/pos/")({ component: POS });

function POS() {
  const { products, categories } = useStore();
  const cart = useCart();
  const [search, setSearch] = useState("");
  const [catId, setCatId] = useState<string>("all");
  const [customer, setCustomer] = useState("");
  const [method, setMethod] = useState<"Tunai" | "QRIS">("Tunai");
  const [paid, setPaid] = useState<string>("");
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = catId === "all" || p.categoryId === catId;
      const okQ = p.name.toLowerCase().includes(search.toLowerCase());
      return okCat && okQ;
    });
  }, [products, catId, search]);

  const detailed = cart.map((c) => {
    const p = products.find((x) => x.id === c.productId)!;
    return { ...c, product: p, lineTotal: p.price * c.qty };
  });
  const subtotal = detailed.reduce((s, d) => s + d.lineTotal, 0);
  const paidNum = parseInt(paid || "0", 10) || 0;
  const change = method === "Tunai" ? Math.max(0, paidNum - subtotal) : 0;
  const canPay = subtotal > 0 && (method === "QRIS" || paidNum >= subtotal);

  async function process() {
    if (!canPay || submitting) return;
    setSubmitting(true);
    setPayError(null);
    try {
      // PERBAIKAN 1: Ambil data user login dari localStorage (untuk cadangan frontend jika diperlukan)
      const userRaw = localStorage.getItem("user");
      const user = userRaw ? JSON.parse(userRaw) : null;

      // Catatan: Pastikan di dalam fungsi `actions.addTransaction` pada file `@/lib/kasir-store` Anda,
      // request Axios/Fetch-nya sudah disisipkan header -> Authorization: `Bearer ${localStorage.getItem("token")}`
      const tx = await actions.addTransaction({
        customer: customer || "Pelanggan",
        method,
        items: detailed.map((d) => ({ name: d.product.name, qty: d.qty, price: d.product.price, unit: d.product.unit })),
        subtotal,
        paid: method === "Tunai" ? paidNum : subtotal,
        change,
        // Menyisipkan nama kasir ke local state store sebagai data pelengkap instant
        cashier_name: user?.name || "Kasir" 
      });
      
      setReceipt(tx);
      cartActions.clear();
      setCustomer(""); setPaid("");
    } catch (err: any) {
      setPayError(err?.message ?? "Gagal memproses pembayaran.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PosShell>
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Catalog */}
        <div className="flex-1 p-6 overflow-y-auto scroll-pretty bg-pink-soft">
          <div>
            <h1 className="font-display text-3xl font-bold text-maroon flex items-center gap-2"><ShoppingCart /> Point of Sale</h1>
            <p className="text-maroon/70 text-sm mt-1">Pilih produk untuk ditambahkan ke keranjang</p>
          </div>


          <div className="relative mt-4">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon/50 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-pill pl-12!" placeholder="Cari bunga atau wrapping..." />
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            <button onClick={() => setCatId("all")} className={`px-5 py-2 rounded-full text-sm font-semibold ${catId === "all" ? "bg-maroon text-primary-foreground" : "bg-card text-maroon"}`}>Semua Produk</button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setCatId(c.id)} className={`px-5 py-2 rounded-full text-sm font-semibold ${catId === c.id ? "bg-maroon text-primary-foreground" : "bg-card text-maroon"}`}>{c.name}</button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => cartActions.add(p.id)}
                className="bg-card rounded-2xl overflow-hidden text-left hover:scale-[1.02] transition shadow-sm"
              >
                <div className="aspect-square overflow-hidden bg-secondary">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3 text-center">
                  <p className="font-semibold text-maroon text-sm">{p.name}</p>
                  <p className="text-pink-deep font-bold mt-1">{formatIDR(p.price)}</p>
                  <p className="text-[10px] text-maroon/60">per {p.unit}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="col-span-full text-center text-maroon/60 py-12">Tidak ada produk.</p>}
          </div>
        </div>

        {/* Cart */}
        <aside className="w-95 shrink-0 bg-olive-soft flex flex-col h-full">
          <div className="p-5 flex items-center justify-between border-b border-maroon/10">
            <div className="flex items-center gap-2 text-maroon">
              <ShoppingCart size={22} />
              <div>
                <h2 className="font-display font-bold text-lg leading-tight">Keranjang Belanja</h2>
                <p className="text-xs">{cart.length} item dipilih</p>
              </div>
            </div>
            <span className="bg-pink-soft text-maroon font-bold rounded-full h-8 w-8 flex items-center justify-center text-sm">{cart.length}</span>
          </div>

          {/* Scrollable items */}
          <div className="flex-1 overflow-y-auto scroll-pretty p-4 space-y-3">
            {detailed.length === 0 && <p className="text-center text-maroon/60 text-sm py-8">Keranjang masih kosong</p>}
            {detailed.map((d) => (
              <div key={d.productId} className="bg-card rounded-xl p-3 flex gap-3 items-center">
                <img src={d.product.image} className="h-12 w-12 rounded-lg object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-maroon text-sm truncate">{d.product.name}</p>
                    <button onClick={() => cartActions.remove(d.productId)} className="text-maroon/60 hover:text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-maroon/60">{formatIDR(d.product.price)} / {d.product.unit}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center bg-secondary rounded-full">
                      <button onClick={() => cartActions.setQty(d.productId, d.qty - 1)} className="h-6 w-6 rounded-full text-maroon font-bold">−</button>
                      <span className="px-2 text-sm font-semibold text-maroon">{d.qty}</span>
                      <button onClick={() => cartActions.setQty(d.productId, d.qty + 1)} className="h-6 w-6 rounded-full text-maroon font-bold">+</button>
                    </div>
                    <p className="text-pink-deep font-bold text-sm">{formatIDR(d.lineTotal)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout */}
          <div className="p-4 space-y-3 border-t border-maroon/10 bg-olive-soft">
            <div>
              <label className="flex items-center gap-1 text-xs text-maroon font-semibold mb-1"><User size={12}/> Nama Pelanggan</label>
              <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="input-pill text-sm py-2" placeholder="Masukkan nama pelanggan" />
            </div>
            <div>
              <label className="text-xs text-maroon font-semibold mb-1 block">Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Tunai", "QRIS"] as const).map((m) => (
                  <button key={m} onClick={() => setMethod(m)} className={`py-3 rounded-xl font-semibold text-sm ${method === m ? "bg-maroon text-primary-foreground" : "bg-pink-soft text-maroon"}`}>
                    {m === "QRIS" ? "Non Tunai" : m}
                  </button>
                ))}
              </div>
            </div>

            {method === "Tunai" && (
              <div>
                <label className="text-xs text-maroon font-semibold mb-1 block">Uang Diterima</label>
                <input inputMode="numeric" value={paid} onChange={(e) => setPaid(e.target.value.replace(/\D/g, ""))} className="input-pill text-sm py-2" placeholder="Masukkan jumlah uang" />
                {paidNum > 0 && <p className="text-[11px] text-maroon mt-1">Kembalian: <b>{formatIDR(change)}</b></p>}
              </div>
            )}
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-maroon">Total Tagihan</span>
              <span className="font-display font-bold text-xl text-maroon">{formatIDR(subtotal)}</span>
            </div>
            {payError && <p className="text-xs text-destructive">{payError}</p>}
            <button disabled={!canPay || submitting} onClick={process} className="w-full py-3 rounded-full font-bold bg-pink-soft text-maroon disabled:opacity-50">
              {submitting ? "Memproses..." : "Proses Pembayaran"}
            </button>
          </div>
        </aside>
      </div>

      {receipt && <ReceiptModal tx={receipt} onClose={() => setReceipt(null)} />}
    </PosShell>
  );
}

function ReceiptModal({ tx, onClose }: { tx: any; onClose: () => void }) {
  const { settings } = useStore();
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto scroll-pretty">
        <div className="text-center border-b border-dashed border-border pb-4 mb-4">
          <Receipt className="mx-auto text-maroon mb-2" />
          <h3 className="font-display text-xl font-bold text-maroon">{settings.shopName}</h3>
          <p className="text-xs text-maroon/70">{settings.address}</p>
          <p className="text-xs text-maroon/70">{settings.phone}</p>
        </div>
        <div className="text-xs text-maroon/80 space-y-1 mb-3">
          <div className="flex justify-between"><span>No.</span><span className="font-mono">{tx.id.toString().slice(0,8)}</span></div>
          <div className="flex justify-between"><span>Tanggal</span><span>{new Date(tx.date).toLocaleString("id-ID")}</span></div>
          <div className="flex justify-between"><span>Pelanggan</span><span>{tx.customer}</span></div>
          
          {/* PERBAIKAN 2: Menampilkan nama kasir di dalam cetak struk modal digital */}
          <div className="flex justify-between"><span>Kasir</span><span className="font-semibold">{tx.cashier_name || "Kasir"}</span></div>
          
          <div className="flex justify-between"><span>Metode</span><span>{tx.method}</span></div>
        </div>
        <div className="border-t border-dashed border-border pt-3 space-y-2 text-sm">
          {tx.items.map((i: any, idx: number) => (
            <div key={idx} className="flex justify-between text-maroon">
              <div>
                <p className="font-semibold">{i.name}</p>
                <p className="text-xs text-maroon/60">{i.qty} × {formatIDR(i.price)}</p>
              </div>
              <p className="font-semibold">{formatIDR(i.qty * i.price)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-dashed border-border mt-3 pt-3 space-y-1 text-sm text-maroon">
          <div className="flex justify-between font-bold"><span>Total</span><span>{formatIDR(tx.subtotal)}</span></div>
          <div className="flex justify-between"><span>Bayar</span><span>{formatIDR(tx.paid)}</span></div>
          <div className="flex justify-between"><span>Kembali</span><span>{formatIDR(tx.change)}</span></div>
        </div>
        <p className="text-center text-xs text-maroon/60 mt-4">Terima kasih sudah berbelanja 🌸</p>
        <div className="flex gap-2 mt-5">
          <button onClick={() => window.print()} className="btn-olive flex-1">Cetak</button>
          <button onClick={onClose} className="btn-maroon flex-1">Tutup</button>
        </div>
      </div>
    </div>
  );
}