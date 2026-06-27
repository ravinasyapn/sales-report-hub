import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart } from "lucide-react";

export const Route = createFileRoute("/admin/user/reports")({
  head: () => ({ meta: [{ title: "Laporan Event — Admin User" }] }),
  component: ReportsPage,
});

const ROWS = [
  { event: "Gempol Signature",     kota: "Bandung", tanggal: "14 Mar 2026", peserta: 24, volunteer: 4, revenue: 9_240_000 },
  { event: "Jakarta Evening",      kota: "Jakarta", tanggal: "22 Mar 2026", peserta: 18, volunteer: 3, revenue: 7_650_000 },
  { event: "Wild Meadow Sunday",   kota: "Bandung", tanggal: "5 Apr 2026",  peserta: 27, volunteer: 5, revenue: 9_450_000 },
  { event: "Pressed Petal Atelier",kota: "Jakarta", tanggal: "19 Apr 2026", peserta: 22, volunteer: 4, revenue: 8_360_000 },
];

const fmtIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");

function ReportsPage() {
  const totalPeserta = ROWS.reduce((a, r) => a + r.peserta, 0);
  const totalVol = ROWS.reduce((a, r) => a + r.volunteer, 0);
  const totalRev = ROWS.reduce((a, r) => a + r.revenue, 0);

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70 inline-flex items-center gap-1.5">
          <FileBarChart className="w-3.5 h-3.5" /> Laporan Event
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Rekap Workshop
        </h1>
        <p className="text-sm text-foreground/70 max-w-3xl">
          Ringkasan peserta, volunteer, dan revenue per event yang sudah terjadwal.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Total Peserta" value={String(totalPeserta)} />
        <Stat label="Total Volunteer" value={String(totalVol)} />
        <Stat label="Total Revenue" value={fmtIDR(totalRev)} />
      </section>

      <div className="rounded-3xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60 text-[10px] uppercase tracking-[0.16em] font-bold text-accent/80">
                <th className="text-left px-5 py-4">Event</th>
                <th className="text-left px-5 py-4">Kota</th>
                <th className="text-left px-5 py-4">Tanggal</th>
                <th className="text-right px-5 py-4">Peserta</th>
                <th className="text-right px-5 py-4">Volunteer</th>
                <th className="text-right px-5 py-4">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.event} className="border-t border-border/60 hover:bg-secondary/30">
                  <td className="px-5 py-4 font-bold text-accent">{r.event}</td>
                  <td className="px-5 py-4 text-accent/85">{r.kota}</td>
                  <td className="px-5 py-4 text-accent/85">{r.tanggal}</td>
                  <td className="px-5 py-4 text-right text-accent/85">{r.peserta}</td>
                  <td className="px-5 py-4 text-right text-accent/85">{r.volunteer}</td>
                  <td className="px-5 py-4 text-right font-bold text-[color:var(--brand-sage)]">{fmtIDR(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-card border border-border p-5">
      <div className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent/70">{label}</div>
      <div className="mt-2 font-serif italic text-3xl font-extrabold text-accent">{value}</div>
    </div>
  );
}
