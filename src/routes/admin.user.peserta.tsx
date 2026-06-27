import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Download, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/user/peserta")({
  head: () => ({ meta: [{ title: "Data Peserta — Admin User" }] }),
  component: DataPesertaPage,
});

type Peserta = {
  id: string;
  nama: string;
  email: string;
  telp: string;
  event: string;
  kota: string;
  tanggal: string;
  status: "paid" | "pending";
};

const MOCK: Peserta[] = [
  { id: "P-2031", nama: "Aulia Rahmani",   email: "aulia.r@mail.com",  telp: "+62 812 3344 1102", event: "Gempol Signature",   kota: "Bandung", tanggal: "14 Mar 2026", status: "paid" },
  { id: "P-2032", nama: "Bima Saputra",    email: "bima.s@mail.com",   telp: "+62 813 8821 5566", event: "Gempol Signature",   kota: "Bandung", tanggal: "14 Mar 2026", status: "paid" },
  { id: "P-2033", nama: "Citra Maharani",  email: "citra.m@mail.com",  telp: "+62 821 7711 2030", event: "Jakarta Evening",    kota: "Jakarta", tanggal: "22 Mar 2026", status: "pending" },
  { id: "P-2034", nama: "Devina Putri",    email: "devina@mail.com",   telp: "+62 819 6655 4421", event: "Wild Meadow Sunday", kota: "Bandung", tanggal: "5 Apr 2026",  status: "paid" },
  { id: "P-2035", nama: "Erik Nugroho",    email: "erik.n@mail.com",   telp: "+62 822 1122 9988", event: "Pressed Petal Atelier", kota: "Jakarta", tanggal: "19 Apr 2026", status: "paid" },
  { id: "P-2036", nama: "Fina Lestari",    email: "fina.l@mail.com",   telp: "+62 813 4455 6677", event: "Jakarta Evening",    kota: "Jakarta", tanggal: "22 Mar 2026", status: "pending" },
  { id: "P-2037", nama: "Gavin Pradipta",  email: "gavin.p@mail.com",  telp: "+62 821 9988 1122", event: "Wild Meadow Sunday", kota: "Bandung", tanggal: "5 Apr 2026",  status: "paid" },
];

function DataPesertaPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");

  const rows = useMemo(() => {
    return MOCK.filter((p) => {
      const matchQ =
        !q ||
        p.nama.toLowerCase().includes(q.toLowerCase()) ||
        p.email.toLowerCase().includes(q.toLowerCase()) ||
        p.id.toLowerCase().includes(q.toLowerCase());
      const matchF = filter === "all" || p.status === filter;
      return matchQ && matchF;
    });
  }, [q, filter]);

  const exportCsv = () => {
    const header = ["ID", "Nama", "Email", "Telp", "Event", "Kota", "Tanggal", "Status"];
    const lines = [header.join(",")].concat(
      rows.map((r) => [r.id, r.nama, r.email, r.telp, r.event, r.kota, r.tanggal, r.status].join(",")),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "peserta.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Daftar Peserta
        </h1>
        <p className="text-sm text-foreground/70 max-w-3xl">
          Catatan semua pendaftar workshop. Filter berdasarkan event, cari nama atau ID, dan ekspor untuk arsip kasir.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, email, atau ID peserta…"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-3 rounded-full bg-card border border-border text-sm font-semibold text-accent focus:outline-none focus:ring-2 focus:ring-accent/40 min-w-[140px]"
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
        <button
          onClick={exportCsv}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition shadow-md"
        >
          <Download className="w-4 h-4" /> EXPORT CSV
        </button>
      </div>

      <div className="rounded-3xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/60 text-[10px] uppercase tracking-[0.16em] font-bold text-accent/80">
                <th className="text-left px-5 py-4">ID</th>
                <th className="text-left px-5 py-4">Nama</th>
                <th className="text-left px-5 py-4">Kontak</th>
                <th className="text-left px-5 py-4">Event</th>
                <th className="text-left px-5 py-4">Tanggal</th>
                <th className="text-left px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60 hover:bg-secondary/30">
                  <td className="px-5 py-4 font-mono text-accent/70">{r.id}</td>
                  <td className="px-5 py-4 font-bold text-accent">{r.nama}</td>
                  <td className="px-5 py-4 text-accent/85">
                    <div>{r.email}</div>
                    <div className="text-xs text-foreground/55">{r.telp}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-accent">{r.event}</div>
                    <div className="text-xs text-foreground/55">{r.kota}</div>
                  </td>
                  <td className="px-5 py-4 text-accent/85">{r.tanggal}</td>
                  <td className="px-5 py-4">
                    {r.status === "paid" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[color-mix(in_oklab,var(--brand-sage)_25%,transparent)] text-[color:var(--brand-sage)] text-xs font-bold uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-accent text-xs font-bold uppercase tracking-wide">
                        <Clock className="w-3.5 h-3.5" /> PENDING
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-foreground/50">Tidak ada peserta cocok.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
