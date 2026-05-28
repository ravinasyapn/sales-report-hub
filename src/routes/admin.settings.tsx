import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Settings as SettingsIcon, AlertTriangle, Loader2, Check, CalendarDays, PencilLine } from "lucide-react";
import { saveAppSettings, useAppSettings, type AppSettings } from "@/hooks/use-app-settings";

// ---------- Dummy katalog event (Hibrida: dropdown otomatis) ----------
const EVENT_PRESETS = [
  { id: "spring-mei",     name: "Spring Bloom Workshop (Mei)",   price: 350_000, address: "Jl. Melati No. 17, Yogyakarta",   phone: "+62 812-3456-7890" },
  { id: "lebaran-juni",   name: "Rangkaian Bunga Lebaran (Juni)",price: 300_000, address: "Jl. Kaliurang KM 7, Yogyakarta",  phone: "+62 812-3456-7890" },
  { id: "tropical-juli",  name: "Tropical Paradise Session (Juli)",price: 400_000,address: "Jl. Magelang No. 42, Yogyakarta", phone: "+62 812-3456-7890" },
];

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Pengaturan — Gurita Bouquet" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const current = useAppSettings();
  const [form, setForm] = useState<AppSettings>({
    event_name: "",
    owner_address: "",
    owner_phone: "",
  });
  const [presetId, setPresetId] = useState<string>("");
  const [useManual, setUseManual] = useState<boolean>(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  useEffect(() => {
    setForm(current);
  }, [current.event_name, current.owner_address, current.owner_phone]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      saveAppSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = EVENT_PRESETS.find((x) => x.id === id);
    if (!p) return;
    if (!useManual) {
      setForm({ event_name: p.name, owner_address: p.address, owner_phone: p.phone });
    } else {
      // hanya isi nama event, biarkan owner tetap manual
      setForm((f) => ({ ...f, event_name: p.name }));
    }
  };

  const resetTransactions = async () => {
    const ok = confirm(
      "Hapus SEMUA transaksi & item kasir? Tindakan ini tidak dapat dibatalkan.",
    );
    if (!ok) return;
    setResetting(true);
    setResetMsg(null);
    try {
      localStorage.removeItem("gb_transactions");
      localStorage.removeItem("gb_transaction_items");
      setResetMsg("Semua transaksi berhasil direset.");
    } catch (e: any) {
      setResetMsg(`Gagal: ${e?.message ?? "unknown"}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
          Pengaturan
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Event & Identitas Owner
        </h1>
        <p className="text-sm text-foreground/70">
          Mode Hibrida — pilih dari jadwal otomatis atau isi manual di lapangan.
        </p>
      </header>

      {/* Hybrid event picker */}
      <section className="rounded-3xl bg-card border border-border p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary text-accent flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-accent text-base sm:text-lg leading-tight">
              Pilih Event
            </h2>
            <p className="text-xs text-foreground/65 mt-0.5">
              Otomatis tarik dari jadwal sistem teman, atau isi manual sebagai cadangan tanpa koneksi.
            </p>
          </div>
        </div>

        <div>
          <span className="block text-[11px] uppercase tracking-[0.18em] font-bold text-accent/80 mb-2">
            Jadwal Tersinkron (Sistem Teman)
          </span>
          <select
            value={presetId}
            onChange={(e) => applyPreset(e.target.value)}
            className="w-full rounded-xl bg-input/60 border border-border px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-sage)] transition"
          >
            <option value="">[ Pilih Event dari Jadwal ]</option>
            {EVENT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Rp {(p.price / 1000).toFixed(0)}rb / org
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useManual}
            onChange={(e) => setUseManual(e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          <span className="text-sm font-semibold text-accent flex items-center gap-1.5">
            <PencilLine className="w-3.5 h-3.5" />
            Override manual (isi sendiri di bawah)
          </span>
        </label>

        <div className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          — atau isi manual di bawah —
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border p-6 sm:p-8 space-y-5">
        <Field
          label="Nama Event Berlangsung"
          placeholder="cth. Workshop Bouquet Edisi Mei"
          value={form.event_name}
          onChange={(v) => setForm((f) => ({ ...f, event_name: v }))}
        />
        <Field
          label="Nama Jalan / Alamat Owner"
          placeholder="cth. Jl. Melati No. 17, Yogyakarta"
          value={form.owner_address}
          onChange={(v) => setForm((f) => ({ ...f, owner_address: v }))}
        />
        <Field
          label="No. Telepon Owner"
          placeholder="+62 812-3456-7890"
          value={form.owner_phone}
          onChange={(v) => setForm((f) => ({ ...f, owner_phone: v }))}
        />

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition shadow-md disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Simpan Pengaturan
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-[var(--brand-sage)] font-semibold">
              <Check className="w-4 h-4" /> Tersimpan & tersinkron
            </span>
          )}
        </div>
      </section>

      <section className="rounded-3xl border-2 border-destructive/40 bg-destructive/5 p-6 sm:p-8 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-serif italic text-2xl font-extrabold text-destructive leading-tight">
              Zona Reset
            </h2>
            <p className="text-sm text-foreground/70 mt-1">
              Hapus seluruh riwayat transaksi & item kasir. Berguna saat memulai
              event baru. Tindakan ini permanen.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={resetTransactions}
            disabled={resetting}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-destructive text-destructive-foreground font-bold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {resetting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SettingsIcon className="w-4 h-4" />
            )}
            Reset Semua Transaksi
          </button>
          {resetMsg && (
            <span className="text-sm font-semibold text-foreground/80">
              {resetMsg}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.18em] font-bold text-accent/80 mb-2">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-input/60 border border-border px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-sage)] transition"
      />
    </label>
  );
}
