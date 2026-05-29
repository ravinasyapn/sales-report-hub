import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PosShell } from "@/components/PosShell";
import { useStore, actions } from "@/lib/pos-store";
import { Settings as SIcon, Save, Trash2 } from "lucide-react";

export const Route = createFileRoute("/pos/settings")({ component: SettingsPage });

function SettingsPage() {
  const { settings } = useStore();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const isOwner = false;

  function save(e: React.FormEvent) {
    e.preventDefault();
    actions.updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <PosShell>
      <div className="p-8 max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon flex items-center gap-2"><SIcon /> Pengaturan</h1>
          <p className="text-maroon/70 text-sm mt-1">Atur informasi toko & preferensi sistem</p>
        </div>

        <form onSubmit={save} className="bg-card rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-display text-xl font-bold text-maroon">Informasi Toko</h3>
          
          {/* Input akan berubah jadi disabled jika bukan owner */}
          <div>
            <label className="text-sm font-semibold text-maroon">Nama Toko</label>
            <input 
              className={`input-pill mt-1 ${!isOwner ? 'opacity-70 cursor-not-allowed bg-gray-100' : ''}`} 
              value={form.shopName} 
              disabled={!isOwner}
              onChange={(e) => setForm({ ...form, shopName: e.target.value })} 
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-maroon">Alamat</label>
            <input 
              className={`input-pill mt-1 ${!isOwner ? 'opacity-70 cursor-not-allowed bg-gray-100' : ''}`} 
              value={form.address} 
              disabled={!isOwner}
              onChange={(e) => setForm({ ...form, address: e.target.value })} 
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-maroon">No. Telepon</label>
            <input 
              className={`input-pill mt-1 ${!isOwner ? 'opacity-70 cursor-not-allowed bg-gray-100' : ''}`} 
              value={form.phone} 
              disabled={!isOwner}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} 
            />
          </div>

          {/* Tombol Simpan hanya muncul jika Owner */}
          {isOwner && (
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-maroon flex items-center gap-2"><Save size={16}/> Simpan</button>
              {saved && <span className="text-sm text-olive font-semibold">✓ Tersimpan</span>}
            </div>
          )}
        </form>

        {/* Zona Bahaya hanya muncul jika Owner */}
        {isOwner && (
          <div className="bg-card rounded-2xl p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-maroon mb-2">Zona Bahaya</h3>
            <p className="text-sm text-maroon/70 mb-3">Reset semua data ke pengaturan awal — tindakan ini tidak bisa dibatalkan.</p>
            <button onClick={() => confirm("Yakin ingin reset semua data?") && actions.reset()} className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full font-semibold text-sm">
              <Trash2 size={14}/> Reset Data
            </button>
          </div>
        )}
      </div>
    </PosShell>
  );
}