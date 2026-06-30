import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useStore, actions } from "@/lib/kasir";
import {
  Printer,
  Calendar as CalendarIcon,
  UserCog,
  Package,
  Wallet,
  Receipt,
  Users,
  QrCode,
  Banknote,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Laporan Penjualan — Admin" }] }),
  component: ReportsPage,
});

// ============================================================
// Types (bentuk internal halaman — diisi dari data ASLI store)
// ============================================================
type PayMethod = "tunai" | "qris";

type Tx = {
  id: string;
  receipt_no: string;
  event_date: string; // YYYY-MM-DD (lokal)
  customer_name: string;
  cashier_id: string;
  cashier_name: string;
  payment_method: PayMethod;
  peserta: number;
  total_amount: number;
  created_at: string;
};

type Item = {
  transaction_id: string;
  product_name: string;
  category: string;
  qty: number;
  price: number;
  subtotal: number;
};

type CashCount = {
  cashier_id: string;
  date: string; // YYYY-MM-DD
  expected_cash: number;
  counted_cash: number;
  note: string;
};

// ============================================================
// Helpers
// ============================================================
const fmt = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmtDate = (s: string) =>
  new Date(s + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const monthKey = (d: string) => d.slice(0, 7);
const fmtMonth = (m: string) =>
  new Date(m + "-01T00:00:00").toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

// ============================================================
// Page
// ============================================================
type ViewMode = "event" | "bulanan";

function ReportsPage() {
  // --- Data ASLI dari store (terhubung ke backend Laravel via /api/transaksi) ---
  const { transactions, products, categories, settings, usingDummy } = useStore();

  // Pastikan data tersinkron walau owner langsung membuka halaman ini.
  useEffect(() => {
    actions.syncAll();
  }, []);

  // Default rentang: dari awal bulan berjalan s/d hari ini.
  const now = new Date();
  const [from, setFrom] = useState(ymd(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(ymd(now));
  const [mode, setMode] = useState<ViewMode>("event");
  const [globalNote, setGlobalNote] = useState(
    "Audit kas akhir hari oleh supervisor. Periksa selisih > Rp 10.000.",
  );
  const [cashierNotes, setCashierNotes] = useState<Record<string, string>>({});
  const [countOverrides, setCountOverrides] = useState<Record<string, number>>({});

  // Lookup kategori berdasarkan nama produk (item_transaksi tidak menyimpan kategori).
  const categoryOf = useMemo(() => {
    const byName = new Map(products.map((p) => [p.name, p.categoryId]));
    const catName = new Map(categories.map((c) => [c.id, c.name]));
    return (productName: string) => {
      const catId = byName.get(productName);
      return (catId && catName.get(catId)) || "—";
    };
  }, [products, categories]);

  // --- Adaptor: transaksi asli -> bentuk Tx / Item yang dipakai tabel di bawah ---
  const allTxs: Tx[] = useMemo(
    () =>
      transactions.map((t) => {
        const d = new Date(t.date);
        const eventDate = isNaN(d.getTime()) ? to : ymd(d);
        const kasir = t.cashier_name || "Kasir";
        return {
          id: String(t.id),
          receipt_no: String(t.id),
          event_date: eventDate,
          customer_name: t.customer,
          cashier_id: kasir, // tanpa tabel kasir terpisah, pakai nama sebagai kunci
          cashier_name: kasir,
          payment_method: (t.method === "QRIS" ? "qris" : "tunai") as PayMethod,
          peserta: 0, // DB tidak melacak peserta workshop
          total_amount: t.subtotal,
          created_at: t.date,
        };
      }),
    [transactions, to],
  );

  const allItems: Item[] = useMemo(
    () =>
      transactions.flatMap((t) =>
        (t.items || []).map((i) => ({
          transaction_id: String(t.id),
          product_name: i.name,
          category: categoryOf(i.name),
          qty: i.qty,
          price: i.price,
          subtotal: i.qty * i.price,
        })),
      ),
    [transactions, categoryOf],
  );

  // Audit kas: ekspektasi tunai dihitung dari transaksi tunai per kasir per hari.
  const allCounts: CashCount[] = useMemo(() => {
    const map = new Map<string, CashCount>();
    for (const t of allTxs) {
      if (t.payment_method !== "tunai") continue;
      const key = `${t.cashier_id}__${t.event_date}`;
      const cur =
        map.get(key) ??
        { cashier_id: t.cashier_id, date: t.event_date, expected_cash: 0, counted_cash: 0, note: "" };
      cur.expected_cash += t.total_amount;
      map.set(key, cur);
    }
    return Array.from(map.values()).map((c) => ({ ...c, counted_cash: c.expected_cash }));
  }, [allTxs]);

  const inRange = (d: string) => d >= from && d <= to;

  const txs = useMemo(() => allTxs.filter((t) => inRange(t.event_date)), [allTxs, from, to]);
  const items = useMemo(() => {
    const txIds = new Set(txs.map((t) => t.id));
    return allItems.filter((i) => txIds.has(i.transaction_id));
  }, [allItems, txs]);
  const counts = useMemo(() => allCounts.filter((c) => inRange(c.date)), [allCounts, from, to]);

  // ---------- Header totals ----------
  const totals = useMemo(() => {
    const omzet = txs.reduce((s, x) => s + x.total_amount, 0);
    const tunai = txs.filter((x) => x.payment_method === "tunai").reduce((s, x) => s + x.total_amount, 0);
    const qris = txs.filter((x) => x.payment_method === "qris").reduce((s, x) => s + x.total_amount, 0);
    const peserta = txs.reduce((s, x) => s + x.peserta, 0);
    return { omzet, tunai, qris, peserta, count: txs.length };
  }, [txs]);

  // ---------- Rekap per kasir ----------
  const byCashier = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; tx: number; tunai: number; qris: number; total: number; peserta: number }
    >();
    for (const t of txs) {
      const cur =
        map.get(t.cashier_id) ?? { id: t.cashier_id, name: t.cashier_name, tx: 0, tunai: 0, qris: 0, total: 0, peserta: 0 };
      cur.tx += 1;
      cur.total += t.total_amount;
      cur.peserta += t.peserta;
      if (t.payment_method === "tunai") cur.tunai += t.total_amount;
      else cur.qris += t.total_amount;
      map.set(t.cashier_id, cur);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [txs]);

  // ---------- Rekap produk (untuk restock) ----------
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

  // ---------- Recap rows by mode ----------
  type RecapRow = {
    key: string;
    label: string;
    sub: string;
    tx: number;
    peserta: number;
    tunai: number;
    qris: number;
    total: number;
  };

  const recapRows: RecapRow[] = useMemo(() => {
    if (mode === "event") {
      const map = new Map<string, RecapRow>();
      for (const t of txs) {
        const cur =
          map.get(t.event_date) ?? {
            key: t.event_date,
            label: fmtDate(t.event_date),
            sub: settings.shopName || "Penjualan harian",
            tx: 0,
            peserta: 0,
            tunai: 0,
            qris: 0,
            total: 0,
          };
        cur.tx += 1;
        cur.peserta += t.peserta;
        cur.total += t.total_amount;
        if (t.payment_method === "tunai") cur.tunai += t.total_amount;
        else cur.qris += t.total_amount;
        map.set(t.event_date, cur);
      }
      return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
    }
    // bulanan
    const map = new Map<string, RecapRow>();
    for (const t of txs) {
      const k = monthKey(t.event_date);
      const cur =
        map.get(k) ?? {
          key: k,
          label: fmtMonth(k),
          sub: "Rekap bulanan gabungan",
          tx: 0,
          peserta: 0,
          tunai: 0,
          qris: 0,
          total: 0,
        };
      cur.tx += 1;
      cur.peserta += t.peserta;
      cur.total += t.total_amount;
      if (t.payment_method === "tunai") cur.tunai += t.total_amount;
      else cur.qris += t.total_amount;
      map.set(k, cur);
    }
    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [txs, mode, settings.shopName]);

  // ---------- Audit selisih ----------
  const auditRows = useMemo(() => {
    return counts.map((c) => {
      const key = `${c.cashier_id}-${c.date}`;
      const counted = countOverrides[key] ?? c.counted_cash;
      const selisih = counted - c.expected_cash;
      return {
        key,
        date: c.date,
        cashier: c.cashier_id,
        expected: c.expected_cash,
        counted,
        selisih,
        defaultNote: c.note || "Masukkan hasil hitung kas fisik",
      };
    });
  }, [counts, countOverrides]);

  const totalSelisih = auditRows.reduce((s, r) => s + r.selisih, 0);

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-6xl mx-auto space-y-8 print:p-0 print:space-y-4 print:max-w-none reports-root">
      <PrintStyles />

      {/* ============ Page header ============ */}
      <header className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
            Laporan
          </div>
          <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
            Laporan Penjualan
          </h1>
          <p className="text-sm text-foreground/70 max-w-xl">
            Audit kas, rekap event, dan restock produk — Gurita Bouquet.
          </p>
          {usingDummy && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
              Menampilkan data contoh — backend belum mengirim data (tambahkan produk &amp; transaksi asli untuk data nyata).
            </p>
          )}
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground font-semibold text-sm px-5 py-3 shadow-md hover:opacity-90 transition"
        >
          <Printer className="w-4 h-4" />
          Print to PDF
        </button>
      </header>

      {/* Print-only title block */}
      <div className="hidden print:block">
        <div className="text-center border-b-2 border-black pb-3 mb-4">
          <div className="text-xl font-extrabold tracking-tight">GURITA BOUQUET</div>
          <div className="text-sm font-semibold mt-0.5">Laporan Penjualan &amp; Audit Kas</div>
          <div className="text-xs mt-1">
            Periode {fmtDate(from)} — {fmtDate(to)} · Mode:{" "}
            {mode === "event" ? "Rekap per Event" : "Rekap Bulanan"}
          </div>
        </div>
      </div>

      {/* ============ Audit Header Cards ============ */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 print:gap-2">
        <StatCard
          icon={Wallet}
          label="Total Omzet"
          value={fmt(totals.omzet)}
          hint={`${totals.count} transaksi`}
          tone="accent"
        />
        <StatCard
          icon={Users}
          label="Total Transaksi"
          value={totals.count.toLocaleString("id-ID")}
          hint="Struk pada periode ini"
          tone="secondary"
        />
        <StatCard
          icon={Banknote}
          label="Total Tunai"
          value={fmt(totals.tunai)}
          hint={pct(totals.tunai, totals.omzet)}
          tone="green"
        />
        <StatCard
          icon={QrCode}
          label="Total Non Tunai"
          value={fmt(totals.qris)}
          hint={pct(totals.qris, totals.omzet)}
          tone="blue"
        />

      </section>

      {/* ============ Filter bar ============ */}
      <section className="bg-card border border-border rounded-2xl p-4 md:p-5 flex flex-wrap items-end gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-accent/70" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent/70">
            Rentang tanggal
          </span>
        </div>
        <DateField label="Dari" value={from} onChange={setFrom} />
        <DateField label="Sampai" value={to} onChange={setTo} />

        <div className="ml-auto flex items-center gap-1 bg-secondary/60 border border-border rounded-full p-1">
          <ToggleBtn active={mode === "event"} onClick={() => setMode("event")}>
            Rekap per Event
          </ToggleBtn>
          <ToggleBtn active={mode === "bulanan"} onClick={() => setMode("bulanan")}>
            Rekap Bulanan
          </ToggleBtn>
        </div>
      </section>

      {/* ============ Recap table (event / bulanan) ============ */}
      <Section
        icon={ClipboardList}
        title={mode === "event" ? "Rekap per Hari" : "Rekap Bulanan"}
        sub={
          mode === "event"
            ? "Setiap baris merepresentasikan satu hari penjualan."
            : "Agregasi seluruh transaksi per bulan."
        }
      >
        <Table>
          <THead>
            <TR>
              <TH>{mode === "event" ? "Tanggal" : "Bulan"}</TH>
              <TH>{mode === "event" ? "Keterangan" : "Keterangan"}</TH>
              <TH className="text-right">Transaksi</TH>
              <TH className="text-right">Tunai</TH>
              <TH className="text-right">Non Tunai</TH>
              <TH className="text-right">Total</TH>
            </TR>
          </THead>
          <tbody>
            {recapRows.map((r) => (
              <TR key={r.key}>
                <TD className="font-semibold text-accent">{r.label}</TD>
                <TD className="text-foreground/70">{r.sub}</TD>
                <TD className="text-right tabular-nums">{r.tx}</TD>
                <TD className="text-right tabular-nums">{fmt(r.tunai)}</TD>
                <TD className="text-right tabular-nums">{fmt(r.qris)}</TD>
                <TD className="text-right tabular-nums font-bold">{fmt(r.total)}</TD>
              </TR>
            ))}
            {recapRows.length === 0 && <EmptyRow cols={6} />}
          </tbody>
          <TFoot
            cells={[
              "Total",
              "",
              recapRows.reduce((s, r) => s + r.tx, 0).toString(),
              fmt(recapRows.reduce((s, r) => s + r.tunai, 0)),
              fmt(recapRows.reduce((s, r) => s + r.qris, 0)),
              fmt(recapRows.reduce((s, r) => s + r.total, 0)),
            ]}
          />
        </Table>
      </Section>

      {/* ============ Rekap per kasir (dengan selisih + catatan) ============ */}
      <Section
        icon={UserCog}
        title="Rekap per Kasir & Audit Selisih Kas"
        sub="Selisih = Uang Fisik (counted) - Ekspektasi Tunai. Edit kolom 'Uang Fisik' untuk mencatat hasil hitung kasir."
      >
        <Table>
          <THead>
            <TR>
              <TH>Tanggal</TH>
              <TH>Kasir</TH>
              <TH className="text-right">Tunai Sistem</TH>
              <TH className="text-right">Uang Fisik</TH>
              <TH className="text-right">Selisih</TH>
              <TH>Catatan Kasir</TH>
            </TR>
          </THead>
          <tbody>
            {auditRows.map((r) => {
              const tone =
                r.selisih === 0
                  ? "text-emerald-600"
                  : r.selisih > 0
                    ? "text-blue-600"
                    : "text-rose-600";
              return (
                <TR key={r.key}>
                  <TD>{fmtDate(r.date)}</TD>
                  <TD className="font-semibold text-accent">{r.cashier}</TD>
                  <TD className="text-right tabular-nums">{fmt(r.expected)}</TD>
                  <TD className="text-right">
                    <input
                      type="number"
                      className="w-32 text-right rounded-lg border border-border bg-background px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/40 print:border-0 print:p-0 print:bg-transparent"
                      value={r.counted}
                      onChange={(e) =>
                        setCountOverrides((s) => ({ ...s, [r.key]: Number(e.target.value) || 0 }))
                      }
                    />
                  </TD>
                  <TD className={`text-right tabular-nums font-bold ${tone}`}>
                    {r.selisih > 0 ? "+" : ""}
                    {fmt(r.selisih)}
                  </TD>
                  <TD>
                    <input
                      type="text"
                      placeholder={r.defaultNote}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 print:border-0 print:p-0 print:bg-transparent"
                      value={cashierNotes[r.key] ?? ""}
                      onChange={(e) =>
                        setCashierNotes((s) => ({ ...s, [r.key]: e.target.value }))
                      }
                    />
                  </TD>
                </TR>
              );
            })}
            {auditRows.length === 0 && <EmptyRow cols={6} />}
          </tbody>
          <TFoot
            cells={[
              "Total",
              `${byCashier.length} kasir`,
              fmt(auditRows.reduce((s, r) => s + r.expected, 0)),
              fmt(auditRows.reduce((s, r) => s + r.counted, 0)),
              (totalSelisih > 0 ? "+" : "") + fmt(totalSelisih),
              "",
            ]}
          />
        </Table>

        {Math.abs(totalSelisih) >= 10000 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              Total selisih kas <b>{fmt(totalSelisih)}</b> melebihi ambang batas Rp 10.000 —
              perlu verifikasi supervisor.
            </div>
          </div>
        )}
      </Section>

      {/* ============ Rekap produk (restock) ============ */}
      <Section
        icon={Package}
        title="Rekap Produk Terjual (Kebutuhan Restock)"
        sub="Urut berdasarkan kuantitas terjual — gunakan sebagai acuan order ulang stok."
      >
        <Table>
          <THead>
            <TR>
              <TH>Produk</TH>
              <TH>Kategori</TH>
              <TH className="text-right">Qty Terjual</TH>
              <TH className="text-right">Subtotal</TH>
              <TH className="text-right">Saran Restock</TH>
            </TR>
          </THead>
          <tbody>
            {byProduct.map((p) => (
              <TR key={p.name}>
                <TD className="font-semibold text-accent">{p.name}</TD>
                <TD className="text-foreground/70">{p.category}</TD>
                <TD className="text-right tabular-nums">{p.qty}</TD>
                <TD className="text-right tabular-nums">{fmt(p.subtotal)}</TD>
                <TD className="text-right tabular-nums">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-accent font-semibold">
                    {Math.ceil(p.qty * 1.2)} pcs
                  </span>
                </TD>
              </TR>
            ))}
            {byProduct.length === 0 && <EmptyRow cols={5} />}
          </tbody>
          <TFoot
            cells={[
              "Total",
              "",
              byProduct.reduce((s, p) => s + p.qty, 0).toString(),
              fmt(byProduct.reduce((s, p) => s + p.subtotal, 0)),
              "",
            ]}
          />
        </Table>
      </Section>

      {/* ============ Detail transaksi ============ */}
      <Section
        icon={Receipt}
        title="Detail Transaksi"
        sub="Riwayat setiap struk dalam periode terpilih."
      >
        <Table>
          <THead>
            <TR>
              <TH>Waktu</TH>
              <TH>No. Struk</TH>
              <TH>Pelanggan</TH>
              <TH>Kasir</TH>
              <TH>Metode</TH>
              <TH className="text-right">Total</TH>
            </TR>
          </THead>
          <tbody>
            {txs
              .slice()
              .sort((a, b) => b.created_at.localeCompare(a.created_at))
              .map((t) => (
                <TR key={t.id}>
                  <TD className="tabular-nums">
                    {fmtDate(t.event_date)}{" "}
                    <span className="text-foreground/50">
                      {new Date(t.created_at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TD>
                  <TD className="font-mono text-xs text-accent">{t.receipt_no}</TD>
                  <TD>{t.customer_name}</TD>
                  <TD className="text-foreground/70">{t.cashier_name}</TD>
                  <TD>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        t.payment_method === "tunai"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {t.payment_method === "tunai" ? (
                        <Banknote className="w-3 h-3" />
                      ) : (
                        <QrCode className="w-3 h-3" />
                      )}
                      {t.payment_method.toUpperCase()}
                    </span>
                  </TD>
                  <TD className="text-right tabular-nums font-bold">{fmt(t.total_amount)}</TD>
                </TR>
              ))}
            {txs.length === 0 && <EmptyRow cols={6} />}
          </tbody>
        </Table>
      </Section>

      {/* ============ Catatan global supervisor ============ */}
      <Section icon={ClipboardList} title="Catatan Audit (Supervisor)" sub="Akan ikut tercetak di PDF.">
        <textarea
          value={globalNote}
          onChange={(e) => setGlobalNote(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 print:border-0 print:p-0 print:bg-transparent"
        />
      </Section>

      {/* Print-only signature block */}
      <div className="hidden print:block mt-10">
        <div className="grid grid-cols-2 gap-12 text-xs">
          <div>
            <div>Mengetahui,</div>
            <div className="h-16" />
            <div className="border-t border-black pt-1 font-semibold">Supervisor</div>
          </div>
          <div>
            <div>Petugas Audit,</div>
            <div className="h-16" />
            <div className="border-t border-black pt-1 font-semibold">Kasir Penanggungjawab</div>
          </div>
        </div>
        <div className="text-[10px] text-center mt-6 text-black/60">
          Dicetak otomatis oleh sistem Gurita Bouquet · {new Date().toLocaleString("id-ID")}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// UI bits
// ============================================================
function pct(part: number, total: number) {
  if (!total) return "0%";
  return ((part / total) * 100).toFixed(1) + "% dari omzet";
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  tone: "accent" | "secondary" | "green" | "blue";
}) {
  const toneMap = {
    accent: "bg-accent text-accent-foreground",
    secondary: "bg-secondary text-accent",
    green: "bg-emerald-100 text-emerald-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-4 md:p-5 flex flex-col gap-3 print:p-3 print:rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-foreground/60">
          {label}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneMap[tone]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-xl md:text-2xl font-extrabold text-accent tabular-nums leading-none">
        {value}
      </div>
      <div className="text-[11px] text-foreground/60">{hint}</div>
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-accent/60">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
        active ? "bg-accent text-accent-foreground shadow-sm" : "text-accent/70 hover:text-accent"
      }`}
    >
      {children}
    </button>
  );
}

function Section({
  icon: Icon,
  title,
  sub,
  children,
}: {
  icon: typeof Wallet;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card border border-border rounded-2xl p-4 md:p-5 print:border-0 print:rounded-none print:p-0 print:break-inside-avoid">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-secondary text-accent flex items-center justify-center shrink-0 print:hidden">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base md:text-lg font-extrabold text-accent tracking-tight">
            {title}
          </h2>
          {sub && <p className="text-xs text-foreground/60 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 md:mx-0 print:mx-0 print:overflow-visible">
        <div className="min-w-full px-4 md:px-0 print:px-0">{children}</div>
      </div>
    </section>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm border-collapse">{children}</table>;
}
function THead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-secondary/50 print:bg-transparent">{children}</thead>;
}
function TR({ children }: { children: React.ReactNode }) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-secondary/20 print:hover:bg-transparent">
      {children}
    </tr>
  );
}
function TH({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-accent/70 print:py-1 print:border-b print:border-black ${className}`}
    >
      {children}
    </th>
  );
}
function TD({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2.5 align-middle print:py-1 ${className}`}>{children}</td>;
}
function TFoot({ cells }: { cells: string[] }) {
  return (
    <tfoot className="bg-secondary/40 font-bold text-accent print:bg-transparent print:border-t-2 print:border-black">
      <tr>
        {cells.map((c, i) => (
          <td
            key={i}
            className={`px-3 py-2.5 ${i >= 2 ? "text-right tabular-nums" : ""} print:py-1`}
          >
            {c}
          </td>
        ))}
      </tr>
    </tfoot>
  );
}
function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-3 py-8 text-center text-foreground/50 text-sm">
        Tidak ada data dalam rentang ini.
      </td>
    </tr>
  );
}

function PrintStyles() {
  return (
    <style>{`
      @media print {
        @page { size: A4; margin: 14mm; }
        html, body { background: #fff !important; }
        body * { visibility: hidden; }
        .reports-root, .reports-root * { visibility: visible; }
        .reports-root { position: absolute; inset: 0; width: 100%; color: #000; }
        .reports-root .bg-card { background: transparent !important; }
        .reports-root input, .reports-root textarea {
          color: #000 !important;
          background: transparent !important;
          border: 0 !important;
          padding: 0 !important;
        }
        .reports-root table { page-break-inside: auto; }
        .reports-root tr { page-break-inside: avoid; }
      }
    `}</style>
  );
}
