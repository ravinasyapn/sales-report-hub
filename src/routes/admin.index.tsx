import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  FileBarChart,
  KeyRound,
  Settings,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Wallet,
  Flower2,
  UserCog,
  CalendarHeart,
  MapPin,
  Phone,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useAdminRole } from "@/hooks/use-admin-role";
import { laporanApi, pengaturanApi, type DashboardData, type PenjualanData, type ApiSettings } from "@/lib/kasir";
import { useOnlineCashiers } from "@/hooks/use-online-cashiers";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const fmtIDR = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtShort = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "jt" : n >= 1000 ? Math.round(n / 1000) + "rb" : String(n);

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const labelDM = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

function AdminDashboard() {
  const [role] = useAdminRole();

  const [dash, setDash] = useState<DashboardData | null>(null);
  const [sales, setSales] = useState<PenjualanData | null>(null);
  const [settings, setSettings] = useState<ApiSettings>({ event_name: "", owner_address: "", owner_phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onlineCashiers = useOnlineCashiers();

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - 6); // 7 hari terakhir
        const [d, s, st] = await Promise.all([
          laporanApi.dashboard(),
          laporanApi.penjualan({ dari: ymd(from), sampai: ymd(today) }),
          pengaturanApi.get().catch(() => ({ event_name: "", owner_address: "", owner_phone: "" }) as ApiSettings),
        ]);
        if (!alive) return;
        setDash(d);
        setSales(s);
        setSettings(st);
      } catch (e: any) {
        if (alive) setError(e?.message || "Gagal memuat data dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Default landing after login: big welcome only (mode Owner)
  if (role !== "kasir") {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="text-[11px] sm:text-xs uppercase tracking-[0.32em] font-bold text-accent/70">
            Selamat Datang
          </div>
          <h1 className="font-serif italic text-5xl sm:text-7xl lg:text-8xl font-extrabold text-accent leading-[1.02] tracking-tight">
            Owner Gurita Bouquet
          </h1>
          <p className="text-base sm:text-lg text-foreground/70 italic">
            by Gurita House
          </p>
        </div>
      </div>
    );
  }

  const topProduct = sales?.produk_terlaris?.[0];
  const lowStock = dash?.produk_stok_menipis ?? [];
  const chartData = (sales?.per_hari ?? []).map((r) => ({ label: labelDM(r.tanggal), omzet: r.omzet, name: r.tanggal }));

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
          Dashboard
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Ringkasan Hari Ini
        </h1>
        <p className="text-sm text-foreground/70">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </header>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 px-3 py-2 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Wallet}
          label="Omzet Hari Ini"
          value={loading ? "…" : fmtIDR(dash?.omzet_hari_ini ?? 0)}
          sub={`Tunai ${fmtIDR(dash?.omzet_tunai ?? 0)} · Non Tunai ${fmtIDR(dash?.omzet_qris ?? 0)}`}
        />
        <StatCard
          icon={Receipt}
          label="Transaksi Hari Ini"
          value={loading ? "…" : String(dash?.jumlah_transaksi ?? 0)}
          sub="Struk kasir"
        />
        <StatCard
          icon={Flower2}
          label="Produk Terlaris (7 hari)"
          value={loading ? "…" : (topProduct?.nama_produk ?? "-")}
          sub={topProduct ? `${topProduct.total_terjual} terjual` : "Belum ada penjualan"}
        />
        <StatCard
          icon={AlertTriangle}
          label="Stok Menipis"
          value={loading ? "…" : `${lowStock.length} produk`}
          sub={lowStock.length ? lowStock.slice(0, 2).map((p) => p.nama_produk).join(" · ") : "Stok aman"}
        />
      </section>

      <EventLiveCard settings={settings} />

      <section className="rounded-3xl bg-card border border-border p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Tren Omzet
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-accent mt-1">
              7 Hari Terakhir
            </h3>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent/60">Total 7 hari</div>
            <div className="text-lg font-extrabold text-accent">{fmtIDR(sales?.total_omzet ?? 0)}</div>
          </div>
        </div>
        <div className="h-56 sm:h-72 -ml-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-foreground/50">
              {loading ? "Memuat…" : "Belum ada transaksi dalam 7 hari terakhir."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--accent)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--accent)" tick={{ fontSize: 10 }} tickFormatter={fmtShort} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  cursor={{ fill: "color-mix(in oklab, var(--secondary) 40%, transparent)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }}
                  formatter={(v: number) => [fmtIDR(v), "Omzet"]}
                  labelFormatter={(_, p) => p?.[0]?.payload?.name ?? ""}
                />
                <Bar dataKey="omzet" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? "var(--accent)" : "color-mix(in oklab, var(--accent) 45%, transparent)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <ShortcutCard to="/pos" icon={ShoppingCart} title="Buka Kasir POS" desc="Sistem kasir Gurita POS (owner & kasir)" />
        <ShortcutCard to="/admin/reports" icon={FileBarChart} title="Laporan Penjualan" desc="Rekap per event & per tangkai" />
        <ShortcutCard to="/admin/accounts" icon={KeyRound} title="Manajemen Akun" desc="Buat & kelola akun kasir" />
        <ShortcutCard to="/admin/settings" icon={Settings} title="Pengaturan & Reset" desc="Pilih event & identitas owner" />
      </section>
    </div>
  );
}

function EventLiveCard({ settings }: { settings: ApiSettings }) {
  const hasEvent = !!settings.event_name;
  return (
    <section className="rounded-3xl bg-card border border-border p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70 flex items-center gap-1.5">
            <CalendarHeart className="w-3.5 h-3.5" /> Event Sedang Berlangsung
          </div>
          <h3 className="font-serif italic text-2xl sm:text-3xl font-extrabold text-accent mt-1 leading-tight">
            {hasEvent ? settings.event_name : "Belum ada event aktif"}
          </h3>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs sm:text-sm text-foreground/75">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent/70" />
              {settings.owner_address || "Alamat belum diset"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-accent/70" />
              {settings.owner_phone || "No. telepon belum diset"}
            </span>
          </div>
          <p className="text-[11px] italic text-foreground/55 mt-2">
            Tersinkron otomatis dengan pengaturan toko.
          </p>
        </div>
        <Link
          to="/admin/settings"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition shrink-0"
        >
          <Settings className="w-4 h-4" /> Edit Pengaturan
        </Link>
      </div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl sm:rounded-3xl bg-card border border-border p-3 sm:p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary/70 text-accent flex items-center justify-center">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="mt-3 text-[9px] sm:text-[10px] uppercase tracking-[0.16em] font-bold text-accent/70 leading-tight">
        {label}
      </div>
      <div className="mt-1 text-base sm:text-xl font-extrabold text-accent leading-tight break-words">
        {value}
      </div>
      {sub && <div className="mt-1 text-[10px] sm:text-xs text-accent/60">{sub}</div>}
    </div>
  );
}

function ShortcutCard({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="block rounded-3xl bg-card border border-border p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-secondary/70 text-accent flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-extrabold text-accent leading-tight truncate">{title}</div>
          <div className="text-xs text-accent/65 truncate">{desc}</div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-accent/50 shrink-0" />
      </div>
    </Link>
  );
}
