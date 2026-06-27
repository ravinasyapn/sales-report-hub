import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarPlus, MapPin, Clock, Users, Trash2, Pencil, X, Save } from "lucide-react";

export const Route = createFileRoute("/admin/user/events")({
  head: () => ({ meta: [{ title: "Tambah Event — Admin User" }] }),
  component: TambahEventPage,
});

type EventItem = {
  id: string;
  judul: string;
  kota: string;
  venue: string;
  tanggal: string; // yyyy-mm-dd
  jam: string;
  kapasitas: number;
  harga: number;
};

const SEED: EventItem[] = [
  { id: "E-014", judul: "Gempol Signature", kota: "Bandung", venue: "Studio Gempol",     tanggal: "2026-03-14", jam: "13:00", kapasitas: 24, harga: 385000 },
  { id: "E-015", judul: "Jakarta Evening",  kota: "Jakarta", venue: "Kemang Loft",        tanggal: "2026-03-22", jam: "18:30", kapasitas: 20, harga: 425000 },
  { id: "E-016", judul: "Wild Meadow Sunday", kota: "Bandung", venue: "Taman Cikapayang", tanggal: "2026-04-05", jam: "10:00", kapasitas: 30, harga: 350000 },
];

const KOTA = ["Bandung", "Jakarta", "Yogyakarta", "Surabaya"];
const emptyForm: Omit<EventItem, "id"> = {
  judul: "", kota: "Bandung", venue: "", tanggal: "", jam: "", kapasitas: 20, harga: 350000,
};

const fmtIDR = (n: number) => "IDR " + n.toLocaleString("id-ID");
const fmtDate = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
};

function TambahEventPage() {
  const [items, setItems] = useState<EventItem[]>(SEED);
  const [form, setForm] = useState<Omit<EventItem, "id">>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const submit = () => {
    if (!form.judul || !form.tanggal) return;
    if (editingId) {
      setItems((arr) => arr.map((e) => (e.id === editingId ? { ...e, ...form } : e)));
    } else {
      const nextN = items.length + 14;
      const id = `E-${String(nextN).padStart(3, "0")}`;
      setItems((arr) => [...arr, { id, ...form }]);
    }
    reset();
  };

  const startEdit = (e: EventItem) => {
    setEditingId(e.id);
    setForm({ judul: e.judul, kota: e.kota, venue: e.venue, tanggal: e.tanggal, jam: e.jam, kapasitas: e.kapasitas, harga: e.harga });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = (id: string) => {
    setItems((arr) => arr.filter((e) => e.id !== id));
    setConfirmId(null);
    if (editingId === id) reset();
  };

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
          Event Management
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Tambah Event Baru
        </h1>
        <p className="text-sm text-foreground/70 max-w-3xl">
          Jadwalkan workshop berikutnya — tentukan kota, kapasitas, dan harga. Event langsung muncul di halaman publik setelah disimpan.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="rounded-3xl bg-card border border-border p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-2 text-accent">
            <CalendarPlus className="w-5 h-5" />
            <h2 className="font-serif italic text-2xl font-extrabold">
              {editingId ? `Edit ${editingId}` : "Event baru"}
            </h2>
          </div>

          <Field label="Judul Event">
            <input
              value={form.judul}
              onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
              placeholder="Pressed Petal Atelier"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kota">
              <select
                value={form.kota}
                onChange={(e) => setForm((f) => ({ ...f, kota: e.target.value }))}
                className="input"
              >
                {KOTA.map((k) => <option key={k}>{k}</option>)}
              </select>
            </Field>
            <Field label="Venue">
              <input
                value={form.venue}
                onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
                placeholder="Studio Gempol"
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tanggal">
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Jam">
              <input
                type="time"
                value={form.jam}
                onChange={(e) => setForm((f) => ({ ...f, jam: e.target.value }))}
                className="input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kapasitas">
              <input
                type="number"
                value={form.kapasitas}
                onChange={(e) => setForm((f) => ({ ...f, kapasitas: Number(e.target.value) }))}
                className="input"
              />
            </Field>
            <Field label="Harga">
              <input
                type="number"
                value={form.harga}
                onChange={(e) => setForm((f) => ({ ...f, harga: Number(e.target.value) }))}
                className="input"
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition shadow-md"
            >
              <Save className="w-4 h-4" /> {editingId ? "Simpan Perubahan" : "Tambah Event"}
            </button>
            {editingId && (
              <button onClick={reset} className="text-sm font-bold text-accent/70 hover:text-accent">
                Batal
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
            {items.length} Event Terjadwal
          </div>
          <div className="space-y-3">
            {items.map((e) => (
              <div key={e.id} className="rounded-3xl bg-card border border-border p-5 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.16em] font-bold text-accent/60">{e.id}</div>
                    <h3 className="font-serif italic text-xl font-extrabold text-accent mt-0.5">{e.judul}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/75">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent/60" /> {e.kota} · {e.venue || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[color:var(--brand-sage)]" /> {fmtDate(e.tanggal)} · {e.jam || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-accent/60" /> {e.kapasitas} seat
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-bold text-[color:var(--brand-sage)]">{fmtIDR(e.harga)}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(e)}
                      className="p-2 rounded-full hover:bg-secondary/60 text-accent/70 hover:text-accent transition"
                      aria-label="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setConfirmId(e.id)}
                      className="p-2 rounded-full hover:bg-destructive/15 text-destructive/80 hover:text-destructive transition"
                      aria-label="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-center py-10 text-foreground/50 text-sm">Belum ada event terjadwal.</div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setConfirmId(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/15 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif italic text-2xl font-extrabold text-accent leading-tight">
                  Apakah yakin untuk menghapus?
                </h3>
                <p className="text-sm text-foreground/70 mt-2">
                  Event <b>{confirmId}</b> akan dihapus secara permanen dari jadwal.
                </p>
              </div>
              <button onClick={() => setConfirmId(null)} className="text-accent/50 hover:text-accent">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmId(null)}
                className="px-5 py-2.5 rounded-full border border-border text-accent font-bold text-sm hover:bg-secondary/60 transition"
              >
                Batal
              </button>
              <button
                onClick={() => remove(confirmId)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input {
          width: 100%;
          border-radius: 9999px;
          background: color-mix(in oklab, var(--secondary) 30%, var(--card));
          border: 1px solid var(--border);
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: box-shadow .15s;
        }
        .input:focus { box-shadow: 0 0 0 2px color-mix(in oklab, var(--accent) 35%, transparent); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.18em] font-bold text-accent/75 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
