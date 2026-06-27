import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, ShieldCheck, CalendarPlus, Flower2, FileBarChart } from "lucide-react";

export const Route = createFileRoute("/admin/user/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin User" }] }),
  component: AdminUserDashboard,
});

const STATS = [
  { icon: Users, label: "Peserta Aktif Bulan Ini", value: "82", sub: "+12%" },
  { icon: ShieldCheck, label: "Volunteer Menunggu Verifikasi", value: "7", sub: "Action needed", highlight: true },
  { icon: FileBarChart, label: "Event Terjadwal", value: "6", sub: "Mar — May" },
  { icon: Flower2, label: "Revenue Workshop (Est.)", value: "IDR 28.4M", sub: "+18%" },
];

const SHORTCUTS = [
  { to: "/admin/user/peserta", icon: Users, title: "Data Peserta", desc: "Daftar pendaftar workshop per event." },
  { to: "/admin/user/volunteer", icon: ShieldCheck, title: "Verifikasi Volunteer", desc: "Approve atau tolak aplikasi volunteer." },
  { to: "/admin/user/events", icon: CalendarPlus, title: "Tambah Event", desc: "Jadwalkan workshop baru di Bandung / Jakarta." },
  { to: "/admin/user/reports", icon: FileBarChart, title: "Laporan Event", desc: "Rekap peserta, volunteer, dan revenue." },
] as const;

function AdminUserDashboard() {
  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-10">
      <header className="space-y-3">
        <h1 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl font-extrabold text-accent leading-[1.05] tracking-tight">
          Selamat datang kembali.
        </h1>
        <p className="text-sm sm:text-base text-foreground/70 max-w-3xl">
          Pantau peserta, volunteer, dan event dari satu tempat. Semua halaman publik dan admin dapat diakses dari sini.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-3xl border border-border p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] ${
                s.highlight ? "bg-secondary/70" : "bg-card"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-secondary/60 text-accent flex items-center justify-center">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="mt-4 text-[10px] uppercase tracking-[0.18em] font-bold text-accent/70 leading-snug">
                {s.label}
              </div>
              <div className="mt-2 font-serif italic text-4xl font-extrabold text-accent leading-tight">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-accent/65">{s.sub}</div>
            </div>
          );
        })}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="font-serif italic text-3xl font-extrabold text-accent">Admin User</h2>
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent/60">: via menu role</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to}
                className="block rounded-3xl bg-card border border-border p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)]"
              >
                <Icon className="w-5 h-5 text-accent" />
                <div className="mt-4 font-serif italic text-xl font-extrabold text-accent">{s.title}</div>
                <div className="mt-1 text-xs text-foreground/65">{s.desc}</div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
