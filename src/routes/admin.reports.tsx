import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Printer, Calendar, UserCog, Package, TrendingUp, Receipt, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Laporan Penjualan — Admin" }] }),
  component: ReportsPage,
});

type Tx = {
  id: string;
  receipt_no: string;
  customer_name: string;
  cashier_name: string;
  payment_method: "tunai" | "qris";
  total_amount: number;
  created_at: string;
};
type Item = {
  transaction_id: string;
  product_name: string;
  category: string;
  qty: number;
  subtotal: number;
};

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");

// ---------- Dummy data ----------
const DUMMY_TX: Tx[] = [
  { id: "t1", receipt_no: "GB-0521-001", customer_name: "Anisa",   cashier_name: "Salsabila Putri", payment_method: "tunai", total_amount: 75000,  created_at: today() + "T09:12:00Z" },
  { id: "t2", receipt_no: "GB-0521-002", customer_name: "Rio",     cashier_name: "Salsabila Putri", payment_method: "qris",  total_amount: 120000, created_at: today() + "T10:34:00Z" },
  { id: "t3", receipt_no: "GB-0521-003", customer_name: "Dewi",    cashier_name: "Rangga Pratama",  payment_method: "tunai", total_amount: 50000,  created_at: today() + "T11:05:00Z" },
  { id: "t4", receipt_no: "GB-0521-004", customer_name: "Bagus",   cashier_name: "Rangga Pratama",  payment_method: "qris",  total_amount: 95000,  created_at: today() + "T12:20:00Z" },
  { id: "t5", receipt_no: "GB-0521-005", customer_name: "Mira",    cashier_name: "Naila Rahmadhani",payment_method: "tunai", total_amount: 60000,  created_at: today() + "T13:50:00Z" },
  { id: "t6", receipt_no: "GB-0521-006", customer_name: "Fahmi",   cashier_name: "Naila Rahmadhani",payment_method: "qris",  total_amount: 145000, created_at: today() + "T15:18:00Z" },
];
const DUMMY_ITEMS: Item[] = [
  { transaction_id: "t1", product_name: "Mawar Merah",     category: "Bunga Tangkai", qty: 5, subtotal: 75000 },
  { transaction_id: "t2", product_name: "Baby Breath",     category: "Bunga Tangkai", qty: 8, subtotal: 80000 },
  { transaction_id: "t2", product_name: "Mawar Putih",     category: "Bunga Tangkai", qty: 2, subtotal: 40000 },
  { transaction_id: "t3", product_name: "Mawar Merah",     category: "Bunga Tangkai", qty: 3, subtotal: 50000 },
  { transaction_id: "t4", product_name: "Lily",            category: "Bunga Tangkai", qty: 3, subtotal: 90000 },
  { transaction_id: "t4", product_name: "Baby Breath",     category: "Bunga Tangkai", qty: 1, subtotal: 5000  },
  { transaction_id: "t5", product_name: "Mawar Merah",     category: "Bunga Tangkai", qty: 4, subtotal: 60000 },
  { transaction_id: "t6", product_name: "Tulip",           category: "Bunga Tangkai", qty: 4, subtotal: 100000 },
  { transaction_id: "t6", product_name: "Mawar Merah",     category: "Bunga Tangkai", qty: 3, subtotal: 45000 },
];

function ReportsPage() {
  const [date, setDate] = useState<string>(today());
  const txs = DUMMY_TX;
  const items = DUMMY_ITEMS;

  const totals = useMemo(() => {
    const total = txs.reduce((s, x) => s + x.total_amount, 0);
    const tunai = txs.filter((x) => x.payment_method === "tunai").reduce((s, x) => s + x.total_amount, 0);
    const qris  = txs.filter((x) => x.payment_method === "qris" ).reduce((s, x) => s + x.total_amount, 0);
    const qty   = items.reduce((s, x) => s + x.qty, 0);
    return { total, tunai, qris, qty, count: txs.length };
  }, [txs, items]);

  const byProduct = useMemo(() => {
    const map = new Map<string, { name: string; category: string; qty: number; subtotal: number }>();
    for (const i of items) {
      const cur = map.get(i.product_name) ?? { name: i.product_name, category: i.category, qty: 0, subtotal: 0 };
      cur.qty += i.qty;
      cur.subtotal += i.subtotal;
      map.set(i.product_name, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.qty - a.qty);
  }, [items]);

  const byTangkai = useMemo(
    () => byProduct.filter((p) => p.category.toLowerCase().includes("tangkai")),
    [byProduct],
  );

  const byCashier = useMemo(() => {
    const map = new Map<string, { name: string; count: number; qty: number; tunai: number; qris: number; total: number }>();
    const itemsByTx = new Map<string, number>();
    for (const it of items) itemsByTx.set(it.transaction_id, (itemsByTx.get(it.transaction_id) ?? 0) + it.qty);
    for (const t of txs) {
      const cur = map.get(t.cashier_name) ?? { name: t.cashier_name, count: 0, qty: 0, tunai: 0, qris: 0, total: 0 };
      cur.count += 1;
      cur.qty += itemsByTx.get(t.id) ?? 0;
      cur.total += t.total_amount;
      if (t.payment_method === "tunai") cur.tunai += t.total_amount;
      else cur.qris += t.total_amount;
      map.set(t.cashier_name, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [txs, items]);

  const print = () => window.print();
  const niceDate = new Date(date + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
      {/* Header — gaya seperti Settings */}
      <header className="print:hidden space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
          Laporan
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Laporan Penjualan
        </h1>
        <p className="text-sm text-foreground/70">
          Rekap transaksi per event (per hari), termasuk rekapan per kasir.
        </p>
      </header>

      {/* Controls */}
      <div className="print:hidden flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] uppercase tracking-[0.18em] font-bold text-accent/80 mb-2 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Tanggal Event
          </label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl bg-input/60 border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-sage)] transition"
          />
        </div>
        <button
          onClick={print}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition shadow-md"
        >
          <Printer className="w-4 h-4" /> Cetak
        </button>
      </div>

      {/* Report */}
      <div id="report-print" className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-6 print:border-0 print:shadow-none print:p-0">
        <div className="text-center border-b border-border pb-4">
          <div className="text-xl font-extrabold text-accent tracking-wide">GURITA BOUQUET.</div>
          <div className="text-[11px] text-muted-foreground">by Gurita House</div>
          <h2 className="mt-3 text-base font-bold text-accent">Laporan Penjualan Harian</h2>
          <div className="text-xs text-muted-foreground">{niceDate}</div>
        </div>

        {/* Summary — 4 kartu ringkasan keuangan */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[
            { l: "Omzet",         v: fmt(totals.total),       icon: TrendingUp, highlight: true },
            { l: "Item Terjual",  v: `${totals.qty} tangkai`, icon: Package },
            { l: "Tunai",         v: fmt(totals.tunai),       icon: Wallet },
            { l: "QRIS",          v: fmt(totals.qris),        icon: Wallet },
          ].map((s) => (
            <div
              key={s.l}
              className={`rounded-2xl p-3 sm:p-4 border ${
                s.highlight
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <s.icon className={`w-4 h-4 ${s.highlight ? "" : "text-accent"}`} />
                <div className={`text-[9px] uppercase tracking-[0.16em] font-bold ${s.highlight ? "text-accent-foreground/80" : "text-accent/70"}`}>
                  {s.l}
                </div>
              </div>
              <div className={`text-sm sm:text-base font-extrabold mt-1.5 ${s.highlight ? "" : "text-accent"}`}>
                {s.v}
              </div>
            </div>
          ))}
        </div>

        {/* Per-cashier */}
        <div>
        <h3 className="font-bold text-accent mb-2 flex items-center gap-1.5 text-sm">
          <UserCog className="w-4 h-4" /> Rekap per Kasir
        </h3>
        <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
          <thead className="bg-secondary text-accent">
            <tr>
              <th className="text-left p-1.5">Kasir</th>
              <th className="text-right p-1.5">Transaksi</th>
              <th className="text-right p-1.5">Item</th>
              <th className="text-right p-1.5">Tunai</th>
              <th className="text-right p-1.5">QRIS</th>
              <th className="text-right p-1.5">Total</th>
            </tr>
          </thead>
          <tbody>
            {byCashier.map((c) => (
              <tr key={c.name} className="border-t border-border">
                <td className="p-1.5 font-semibold text-accent">{c.name}</td>
                <td className="p-1.5 text-right">{c.count}</td>
                <td className="p-1.5 text-right">{c.qty}</td>
                <td className="p-1.5 text-right">{fmt(c.tunai)}</td>
                <td className="p-1.5 text-right">{fmt(c.qris)}</td>
                <td className="p-1.5 text-right font-extrabold text-accent">{fmt(c.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Rekap Bunga Per Tangkai */}
        <div>
        <h3 className="font-bold text-accent mb-2 flex items-center gap-1.5 text-sm">
          <Package className="w-4 h-4" /> Rekap Bunga Per Tangkai
        </h3>
        <p className="text-[11px] text-muted-foreground mb-2">
          Audit operasional & dasar restock stok.
        </p>
        <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
          <thead className="bg-secondary text-accent">
            <tr>
              <th className="text-left p-1.5">Bunga</th>
              <th className="text-right p-1.5">Tangkai Terjual</th>
              <th className="text-right p-1.5">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {byTangkai.map((p) => (
              <tr key={p.name} className="border-t border-border">
                <td className="p-1.5 font-semibold text-accent">
                  {p.name}
                </td>
                <td className="p-1.5 text-right font-bold">{p.qty}</td>
                <td className="p-1.5 text-right font-semibold">{fmt(p.subtotal)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-accent bg-secondary">
              <td className="p-1.5 text-right font-extrabold text-accent">TOTAL</td>
              <td className="p-1.5 text-right font-extrabold text-accent">
                {byTangkai.reduce((s, p) => s + p.qty, 0)} tangkai
              </td>
              <td className="p-1.5 text-right font-extrabold text-accent">
                {fmt(byTangkai.reduce((s, p) => s + p.subtotal, 0))}
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        {/* Detail */}
        <div>
        <h3 className="font-bold text-accent mb-2 text-sm">Detail Transaksi</h3>
        <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
          <thead className="bg-secondary text-accent">
            <tr>
              <th className="text-left p-1.5">Waktu</th>
              <th className="text-left p-1.5">No. Struk</th>
              <th className="text-left p-1.5">Kasir</th>
              <th className="text-left p-1.5">Pelanggan</th>
              <th className="text-left p-1.5">Bayar</th>
              <th className="text-right p-1.5">Total</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="p-1.5">{new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</td>
                <td className="p-1.5 font-mono text-[10px]">{t.receipt_no}</td>
                <td className="p-1.5 font-semibold text-accent">{t.cashier_name}</td>
                <td className="p-1.5">{t.customer_name}</td>
                <td className="p-1.5 uppercase text-[10px] font-bold">{t.payment_method}</td>
                <td className="p-1.5 text-right font-semibold">{fmt(t.total_amount)}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-accent bg-secondary">
              <td colSpan={5} className="p-1.5 text-right font-extrabold text-accent">TOTAL</td>
              <td className="p-1.5 text-right font-extrabold text-accent">{fmt(totals.total)}</td>
            </tr>
          </tbody>
        </table>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 text-xs text-center">
          <div>
            <div className="text-muted-foreground">Dibuat oleh,</div>
            <div className="h-12" />
            <div className="border-t border-accent pt-1 font-semibold text-accent">Kasir</div>
          </div>
          <div>
            <div className="text-muted-foreground">Disetujui oleh,</div>
            <div className="h-12" />
            <div className="border-t border-accent pt-1 font-semibold text-accent">Owner</div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-print, #report-print * { visibility: visible; }
          #report-print { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 16mm; }
        }
      `}</style>
    </div>
  );
}
