import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PosShell } from "@/components/kasir/CangkangKasir";
import { useStore, formatIDR, isOwner } from "@/lib/kasir";
import { Store, Search, Receipt as RIcon } from "lucide-react";

export const Route = createFileRoute("/pos/history")({ component: History });

function History() {
  const { transactions } = useStore();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<typeof transactions[0] | null>(null);
  const currentUser = { role: isOwner() ? "owner" : "kasir" };

  // Mengoptimalkan pencarian agar mendukung pencarian berdasarkan nama Kasir
  const filtered = useMemo(() =>
    transactions.filter((t) =>
      t.customer.toLowerCase().includes(q.toLowerCase()) ||
      t.id.includes(q) ||
      (t.invoice && t.invoice.toLowerCase().includes(q.toLowerCase())) ||
      (t.cashier_name && t.cashier_name.toLowerCase().includes(q.toLowerCase()))
    ),
    [transactions, q]
  );

  const total = filtered.reduce((s, t) => s + t.subtotal, 0);
  const totalCount = transactions.length;
  const totalRevenue = transactions.reduce((s, t) => s + t.subtotal, 0);
  
  // Hitung total pendapatan per individu Kasir khusus konsumsi Owner
  const revenuePerCashier = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const name = t.cashier_name || "Kasir";
      acc[name] = (acc[name] || 0) + t.subtotal;
      return acc;
    }, {} as Record<string, number>);
  }, [transactions]);

  const methodCounts = transactions.reduce(
    (acc, t) => { acc[t.method] = (acc[t.method] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  const flowerCounts: Record<string, number> = {};
  transactions.forEach((t) => t.items.forEach((i) => { flowerCounts[i.name] = (flowerCounts[i.name] || 0) + i.qty; }));
  const topFlower = Object.entries(flowerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  const formatK = (n: number) => n >= 1000 ? `Rp ${Math.round(n / 1000).toLocaleString("id-ID")}k` : formatIDR(n);

  return (
    <PosShell>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon flex items-center gap-2"><Store /> Riwayat Transaksi</h1>
          <p className="text-maroon/70 text-sm mt-1">Pantau dan kelola semua transaksi penjualan</p>
        </div>

        {/* FIX: Ringkasan pendapatan sensitif ini HANYA dirender jika user adalah OWNER */}
        {currentUser.role === "owner" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-2xl p-5">
              <p className="text-sm text-maroon/70">Total Transaksi</p>
              <p className="font-display text-4xl font-bold text-pink-deep mt-3">{totalCount}</p>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <p className="text-sm text-maroon/70">Total Pendapatan</p>
              <p className="font-display text-3xl font-bold text-olive-foreground mt-3" style={{ color: "var(--olive)" }}>{formatK(totalRevenue)}</p>
              <div className="mt-3 pt-2 border-t border-dashed border-border text-[11px] text-maroon/60 space-y-0.5">
                {Object.entries(revenuePerCashier).map(([name, rev]) => (
                  <div key={name} className="flex justify-between">
                    <span className="truncate max-w-20">{name}:</span>
                    <span className="font-semibold">{formatIDR(rev)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <p className="text-sm text-maroon/70 mb-3">Metode Pembayaran</p>
              <div className="flex gap-6">
                <div><p className="text-xs text-maroon/70">Tunai</p><p className="text-lg font-bold text-maroon">{methodCounts["Tunai"] || 0}</p></div>
                <div><p className="text-xs text-maroon/70">Non Tunai</p><p className="text-lg font-bold text-maroon">{methodCounts["QRIS"] || 0}</p></div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-5">
              <p className="text-sm text-maroon/70">Bunga Terlaris</p>
              <p className="font-display text-3xl font-bold text-maroon mt-3 truncate">{topFlower}</p>
            </div>
          </div>
        )}

        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon/50 pointer-events-none" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari berdasarkan struk, nama pelanggan, atau nama kasir" className="input-pill pl-12! bg-card w-full" />
        </div>


        {/* Info filter teks disembunyikan total nominalnya jika diakses oleh Kasir */}
        <p className="text-maroon/70 text-sm">
          {filtered.length} transaksi {currentUser.role === "owner" && `· Total ${formatIDR(total)}`}
        </p>

        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-maroon">
              <tr>
                <th className="text-left p-4">Tanggal</th>
                <th className="text-left p-4">No. Struk</th>
                <th className="text-left p-4">Pelanggan</th>
                <th className="text-left p-4">Item</th>
                <th className="text-left p-4">Metode</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Kasir</th>
                <th className="text-right p-4">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const statusStyle =
                  t.status === "Lunas" ? "bg-olive/15 text-olive" :
                  t.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-700";
                return (
                  <tr key={t.id} className="border-t border-border text-maroon hover:bg-secondary/40">
                    <td className="p-3">{new Date(t.date).toLocaleString("id-ID")}</td>
                    <td className="p-3 font-mono text-xs">{t.invoice}</td>
                    <td className="p-3 font-semibold">{t.customer}</td>
                    <td className="p-3">{t.items.length} item</td>
                    <td className="p-3"><span className="text-xs px-2 py-1 rounded-full bg-secondary">{t.method}</span></td>
                    <td className="p-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle}`}>{t.status}</span></td>
                    <td className="p-3">
                      <span className="bg-olive/10 text-olive text-xs px-2.5 py-1 rounded-md font-medium">
                        {t.cashier_name || "Kasir"}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold">{formatIDR(t.subtotal)}</td>
                    <td className="p-3 text-right"><button onClick={() => setSelected(t)} className="btn-maroon text-xs py-1.5 px-3">Detail</button></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={9} className="p-12 text-center text-maroon/60">Belum ada transaksi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Struk */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto scroll-pretty">
            <div className="text-center border-b border-dashed border-border pb-3 mb-3">
              <RIcon className="mx-auto text-maroon mb-1" />
              <h3 className="font-display text-xl font-bold text-maroon">Detail Transaksi</h3>
              <p className="text-xs text-maroon/60 font-mono">{selected.id.slice(0, 8)}</p>
            </div>
            <div className="text-xs space-y-1 text-maroon mb-3">
              <div className="flex justify-between"><span>Tanggal</span><span>{new Date(selected.date).toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between"><span>Pelanggan</span><span>{selected.customer}</span></div>
              <div className="flex justify-between"><span>Metode</span><span>{selected.method}</span></div>
              <div className="flex justify-between"><span>Kasir</span><span className="font-semibold">{selected.cashier_name || "Kasir"}</span></div>
            </div>
            <div className="border-t border-dashed border-border pt-3 space-y-2 text-sm">
              {selected.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-maroon">
                  <div><p className="font-semibold">{i.name}</p><p className="text-xs text-maroon/60">{i.qty} × {formatIDR(i.price)}</p></div>
                  <p className="font-semibold">{formatIDR(i.qty * i.price)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-dashed border-border mt-3 pt-3 space-y-1 text-sm text-maroon">
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatIDR(selected.subtotal)}</span></div>
              <div className="flex justify-between"><span>Bayar</span><span>{formatIDR(selected.paid)}</span></div>
              <div className="flex justify-between"><span>Kembali</span><span>{formatIDR(selected.change)}</span></div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-maroon w-full mt-5">Tutup</button>
          </div>
        </div>
      )}
    </PosShell>
  );
}