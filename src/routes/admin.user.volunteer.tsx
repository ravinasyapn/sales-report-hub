import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, MessageCircle, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/user/volunteer")({
  head: () => ({ meta: [{ title: "Verifikasi Volunteer — Admin User" }] }),
  component: VolunteerPage,
});

type VStatus = "pending" | "approved" | "rejected";
type Volunteer = {
  id: string;
  nama: string;
  kota: string;
  waktu: string;
  email: string;
  telp: string;
  alasan: string;
  pengalaman: string;
  status: VStatus;
};

const SEED: Volunteer[] = [
  { id: "V-118", nama: "Salma Hapsari",  kota: "Bandung", waktu: "2 hari lalu", email: "salma.h@mail.com", telp: "+62 812 3344 5577", alasan: "Ingin belajar floral styling sambil membantu komunitas.", pengalaman: "Pernah jadi panitia art market kampus", status: "pending" },
  { id: "V-119", nama: "Reza Pratama",   kota: "Jakarta", waktu: "3 hari lalu", email: "reza.p@mail.com",  telp: "+62 821 7788 9911", alasan: "Pencinta tanaman, ingin pengalaman event management.", pengalaman: "Co-host workshop kopi", status: "pending" },
  { id: "V-120", nama: "Niken Ayu",      kota: "Bandung", waktu: "4 hari lalu", email: "niken.a@mail.com", telp: "+62 813 5566 1199", alasan: "Senang bunga dan dekorasi.", pengalaman: "Anggota klub seni SMA", status: "pending" },
  { id: "V-121", nama: "Yoga Aditya",    kota: "Jakarta", waktu: "5 hari lalu", email: "yoga.a@mail.com",  telp: "+62 819 1122 8877", alasan: "Ingin networking di komunitas kreatif.", pengalaman: "Volunteer marketplace lokal", status: "pending" },
  { id: "V-115", nama: "Maya Kirana",    kota: "Bandung", waktu: "1 minggu lalu", email: "maya.k@mail.com", telp: "+62 812 9988 7766", alasan: "Ingin terlibat aktif dalam workshop.", pengalaman: "Volunteer 3 event sebelumnya", status: "approved" },
  { id: "V-110", nama: "Bagas Pramudya", kota: "Jakarta", waktu: "2 minggu lalu", email: "bagas.p@mail.com", telp: "+62 821 4433 1100", alasan: "—", pengalaman: "—", status: "rejected" },
];

function VolunteerPage() {
  const [data, setData] = useState<Volunteer[]>(SEED);
  const [tab, setTab] = useState<VStatus>("pending");

  const counts = useMemo(() => ({
    pending: data.filter((d) => d.status === "pending").length,
    approved: data.filter((d) => d.status === "approved").length,
    rejected: data.filter((d) => d.status === "rejected").length,
  }), [data]);

  const list = data.filter((d) => d.status === tab);

  const setStatus = (id: string, status: VStatus) =>
    setData((arr) => arr.map((v) => (v.id === id ? { ...v, status } : v)));

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Verifikasi Volunteer
        </h1>
        <p className="text-sm text-foreground/70 max-w-3xl">
          Tinjau aplikasi volunteer baru. Setujui untuk masuk ke daftar shift event berikutnya, atau tolak dengan catatan.
        </p>
      </header>

      <div className="border-b border-border flex gap-8 text-sm font-bold uppercase tracking-[0.16em]">
        {(["pending", "approved", "rejected"] as VStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`pb-3 -mb-px transition ${
              tab === s ? "text-accent border-b-2 border-accent" : "text-accent/45 hover:text-accent/80"
            }`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {list.map((v) => (
          <article key={v.id} className="rounded-3xl bg-card border border-border p-6 space-y-4">
            <div>
              <h3 className="font-serif italic text-2xl font-extrabold text-accent">{v.nama}</h3>
              <div className="text-xs text-foreground/55 mt-1">
                {v.id} · {v.kota} · {v.waktu}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-accent/85">
                <Mail className="w-4 h-4 text-accent/60" /> {v.email}
              </div>
              <div className="flex items-center gap-2 text-accent/85">
                <MessageCircle className="w-4 h-4 text-accent/60" /> {v.telp}
              </div>
            </div>
            <div className="pt-2 border-t border-border/60">
              <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-accent/60">Alasan Bergabung</div>
              <p className="text-sm text-foreground/85 mt-1">{v.alasan}</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-accent/60">Pengalaman</div>
              <p className="text-sm text-foreground/85 mt-1">{v.pengalaman}</p>
            </div>
            {v.status === "pending" && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setStatus(v.id, "approved")}
                  className="inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[color:var(--brand-sage)] text-white font-bold text-sm hover:opacity-90 transition"
                >
                  <Check className="w-4 h-4" /> SETUJUI
                </button>
                <button
                  onClick={() => setStatus(v.id, "rejected")}
                  className="inline-flex items-center justify-center gap-2 py-3 rounded-full border border-border text-accent font-bold text-sm hover:bg-secondary/60 transition"
                >
                  <X className="w-4 h-4" /> TOLAK
                </button>
              </div>
            )}
            {v.status !== "pending" && (
              <div className="pt-2">
                <button
                  onClick={() => setStatus(v.id, "pending")}
                  className="text-xs uppercase tracking-[0.18em] font-bold text-accent/60 hover:text-accent transition"
                >
                  Kembalikan ke Pending
                </button>
              </div>
            )}
          </article>
        ))}
        {list.length === 0 && (
          <div className="lg:col-span-2 text-center py-16 text-foreground/50 text-sm">
            Tidak ada data pada tab {tab}.
          </div>
        )}
      </div>
    </div>
  );
}
