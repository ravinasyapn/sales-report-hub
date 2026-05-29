import { createFileRoute, Link } from "@tanstack/react-router";
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
import { useAppSettings } from "@/hooks/use-app-settings";
import { useOnlineCashiers } from "@/hooks/use-online-cashiers";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

const fmtIDR = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtShort = (n: number) =>
  n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + "jt" : n >= 1000 ? Math.round(n / 1000) + "rb" : String(n);

// ---------- Dummy event-centric data ----------
const LAST_EVENTS = [
  { label: "10/05", name: "Spring Bloom (Mei W1)", omzet: 1_850_000 },
  { label: "11/05", name: "Spring Bloom (Mei W1)", omzet: 1_420_000 },
  { label: "17/05", name: "Mother's Day Special",  omzet: 2_650_000 },
  { label: "18/05", name: "Mother's Day Special",  omzet: 2_180_000 },
  { label: "27/05", name: "Rangkaian Lebaran",     omzet: 2_180_000 },
];
const LAST_EVENT = {
  name: "Rangkaian Lebaran (Mei W4)",
  date: "27/05/2026",
  omzet: 2_180_000,
  trxCount: 18,
  topProduct: { name: "Mawar Merah", qty: 32 },
};

function AdminDashboard() {
  const [role] = useAdminRole();
  const settings = useAppSettings();
  const cashiers = useOnlineCashiers();

  // Default landing after login: big welcome only
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

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
          Dashboard
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Snapshot Event Terakhir
        </h1>
        <p className="text-sm text-foreground/70">
          {LAST_EVENT.name} · {LAST_EVENT.date}
        </p>
      </header>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Wallet}
          label="Pendapatan Event Terakhir"
          value={fmtIDR(LAST_EVENT.omzet)}
          sub={LAST_EVENT.date}
        />
        <StatCard
          icon={Receipt}
          label="Total Transaksi"
          value={String(LAST_EVENT.trxCount)}
          sub="Struk kasir"
        />
        <StatCard
          icon={Flower2}
          label="Produk Bunga Terlaris"
          value={LAST_EVENT.topProduct.name}
          sub={`${LAST_EVENT.topProduct.qty} tangkai`}
        />
        <StatCard
          icon={UserCog}
          label="Kasir Online"
          value={`${cashiers.length} aktif`}
          sub={cashiers.length ? cashiers.map((c) => c.name.split(" ")[0]).join(" · ") : "Belum ada kasir login"}
        />
      </section>

      <EventLiveCard settings={settings} cashiers={cashiers.length} />

      <section className="rounded-3xl bg-card border border-border p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Tren Omzet
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-accent mt-1">
              5 Sesi Workshop Terakhir
            </h3>
          </div>
        </div>
        <div className="h-56 sm:h-72 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={LAST_EVENTS} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="var(--accent)"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--accent)"
                tick={{ fontSize: 10 }}
                tickFormatter={fmtShort}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                cursor={{ fill: "color-mix(in oklab, var(--secondary) 40%, transparent)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: 12,
                }}
                formatter={(v: number) => [fmtIDR(v), "Omzet"]}
                labelFormatter={(_, p) => p?.[0]?.payload?.name ?? ""}
              />
              <Bar dataKey="omzet" radius={[8, 8, 0, 0]}>
                {LAST_EVENTS.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === LAST_EVENTS.length - 1 ? "var(--accent)" : "color-mix(in oklab, var(--accent) 45%, transparent)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <ShortcutCard
          href="/pos"
          external
          icon={ShoppingCart}
          title="Buka Kasir POS"
          desc="Buka sistem kasir eksternal Gurita POS"
        />
        <ShortcutCard
          to="/admin/reports"
          icon={FileBarChart}
          title="Laporan Penjualan"
          desc="Rekap per event & per tangkai"
        />
        <ShortcutCard
          to="/admin/accounts"
          icon={KeyRound}
          title="Manajemen Akun"
          desc="Buat & kelola akun kasir"
        />
        <ShortcutCard
          to="/admin/settings"
          icon={Settings}
          title="Pengaturan & Reset"
          desc="Pilih event & identitas owner"
        />
      </section>
    </div>
  );
}

function EventLiveCard({
  settings,
  cashiers,
}: {
  settings: { event_name: string; owner_address: string; owner_phone: string };
  cashiers: number;
}) {
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
            <span className="inline-flex items-center gap-1.5">
              <UserCog className="w-3.5 h-3.5 text-accent/70" />
              {cashiers} kasir online
            </span>
          </div>
          <p className="text-[11px] italic text-foreground/55 mt-2">
            Tersinkron otomatis dengan aplikasi kasir.
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
  href,
  external,
  icon: Icon,
  title,
  desc,
}: {
  to?: string;
  href?: string;
  external?: boolean;
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  const inner = (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-secondary/70 text-accent flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-lg font-extrabold text-accent leading-tight truncate">
          {title}
        </div>
        <div className="text-xs text-accent/65 truncate">{desc}</div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-accent/50 shrink-0" />
    </div>
  );
  const cls =
    "block rounded-3xl bg-card border border-border p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]";
  if (external && href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={to!} className={cls}>
      {inner}
    </Link>
  );
}
