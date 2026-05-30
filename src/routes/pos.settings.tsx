import { createFileRoute } from "@tanstack/react-router";
import { PosShell } from "@/components/pos/PosShell";
import { isOwner } from "@/lib/pos";
import { useAppSettings, saveAppSettings } from "@/hooks/use-app-settings";
import { Settings as SIcon, Save, ShieldAlert, Info } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/pos/settings")({ component: SettingsPage });

function SettingsPage() {
  const admin = useAppSettings();
  const owner = isOwner();
  const [form, setForm] = useState(admin);
  const [saved, setSaved] = useState(false);

  // Selalu sinkronkan ketika pengaturan admin berubah
  useEffect(() => { setForm(admin); }, [admin.event_name, admin.owner_address, admin.owner_phone]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!owner) return;
    saveAppSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <PosShell>
      <div className="p-8 max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon flex items-center gap-2"><SIcon /> Pengaturan</h1>
          <p className="text-maroon/70 text-sm mt-1">
            Data toko diambil dari pengaturan Admin. {owner ? "Anda Owner — perubahan akan ikut tersimpan di panel Admin." : "Anda login sebagai Kasir — hanya bisa melihat."}
          </p>
        </div>

        <div className={`rounded-2xl p-4 border text-sm flex items-start gap-3 ${owner ? "bg-pink-soft border-maroon/20 text-maroon" : "bg-secondary border-border text-maroon"}`}>
          {owner ? <Info size={18} className="mt-0.5" /> : <ShieldAlert size={18} className="mt-0.5" />}
          <span>{owner
            ? "Pengaturan ini tersinkron dengan halaman Admin → Pengaturan."
            : "Mode read-only. Hubungi Owner untuk perubahan pengaturan toko."}
          </span>
        </div>

        <form onSubmit={save} className="bg-card rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-display text-xl font-bold text-maroon">Informasi Toko</h3>

          <Field label="Nama Toko / Event" value={form.event_name} disabled={!owner}
            onChange={(v) => setForm({ ...form, event_name: v })} />
          <Field label="Alamat Owner" value={form.owner_address} disabled={!owner}
            onChange={(v) => setForm({ ...form, owner_address: v })} />
          <Field label="No. Telepon Owner" value={form.owner_phone} disabled={!owner}
            onChange={(v) => setForm({ ...form, owner_phone: v })} />

          {owner && (
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-maroon flex items-center gap-2">
                <Save size={16} /> Simpan
              </button>
              {saved && <span className="text-sm font-semibold" style={{ color: "var(--olive)" }}>✓ Tersimpan</span>}
            </div>
          )}
        </form>
      </div>
    </PosShell>
  );
}

function Field({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="text-sm font-semibold text-maroon">{label}</label>
      <input
        className={`input-pill mt-1 ${disabled ? "opacity-70 cursor-not-allowed bg-secondary" : ""}`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
