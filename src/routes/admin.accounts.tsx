import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { UserPlus, Trash2, Search, ShieldCheck, X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { penggunaApi, type ApiUser } from "@/lib/kasir";

export const Route = createFileRoute("/admin/accounts")({
  head: () => ({ meta: [{ title: "Manajemen Akun — Admin" }] }),
  component: AccountsPage,
});

function AccountsPage() {
  const [rows, setRows] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [confirmDelete, setConfirmDelete] = useState<ApiUser | null>(null);

  // Muat daftar akun dari backend
  const load = async () => {
    setLoading(true);
    try {
      setRows(await penggunaApi.list());
    } catch (e: any) {
      toast.error(e?.message || "Gagal memuat daftar akun");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        (r.phone ?? "").toLowerCase().includes(term),
    );
  }, [rows, q]);

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error("Lengkapi semua kolom wajib");
    if (form.password.length < 6) return toast.error("Password minimal 6 karakter");
    setSubmitting(true);
    try {
      const created = await penggunaApi.create({
        name: form.name,
        email: form.email.toLowerCase(),
        phone: form.phone,
        password: form.password,
        role: "kasir",
      });
      setRows((r) => [created, ...r]);
      setForm({ name: "", email: "", phone: "", password: "" });
      setOpenForm(false);
      toast.success("Akun Kasir berhasil dibuat");
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat akun");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmRemove = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setConfirmDelete(null);
    try {
      await penggunaApi.remove(target.id);
      // Backend menonaktifkan (bukan hapus permanen) karena akun terikat transaksi.
      setRows((r) => r.map((x) => (x.id === target.id ? { ...x, status: "nonaktif" } : x)));
      toast.success(`Akun ${target.name} dinonaktifkan`);
    } catch (e: any) {
      toast.error(e?.message || "Gagal menonaktifkan akun");
    }
  };

  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-6xl mx-auto space-y-8">
      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
          Manajemen
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Manajemen Akun
        </h1>
        <p className="text-sm text-foreground/70 max-w-xl">
          Hanya Owner yang dapat membuat akun <strong>Kasir</strong> untuk volunteer yang
          akan bertugas di event.
        </p>
        <div className="pt-2">
          <button
            onClick={() => setOpenForm(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-accent text-accent-foreground font-bold text-sm shadow-md hover:opacity-90 transition"
          >
            <UserPlus className="w-4 h-4" /> Daftarkan Kasir Baru
          </button>
        </div>
      </header>

      <section className="rounded-3xl bg-card border border-border p-5 sm:p-6 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-accent/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama, email, telepon…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-input/60 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-sage)] transition"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Total akun: <span className="font-bold text-accent">{rows.length}</span>
        </div>
      </section>

      <section className="rounded-3xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-accent text-left text-[11px] uppercase tracking-[0.14em]">
              <tr>
                <th className="px-4 py-3 font-bold">Nama</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold">Telepon</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Memuat akun…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Tidak ada akun ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 font-semibold text-accent">{a.name}</td>
                    <td className="px-4 py-3">{a.email}</td>
                    <td className="px-4 py-3">{a.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                        a.role === "owner" ? "bg-primary/15 text-primary" : "bg-secondary text-accent"
                      }`}>
                        {a.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                          a.status === "aktif"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" /> {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setConfirmDelete(a)}
                        disabled={a.role === "owner"}
                        title={a.role === "owner" ? "Akun owner tidak bisa dinonaktifkan di sini" : "Nonaktifkan akun"}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-3 h-3" /> Nonaktifkan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {openForm && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOpenForm(false)}
        >
          <div
            className="bg-card rounded-xl w-full max-w-sm p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-accent flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Daftarkan Kasir
              </h2>
              <button onClick={() => setOpenForm(false)} className="p-1 rounded hover:bg-secondary text-accent">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Akun baru otomatis memiliki role <strong>Kasir</strong>.
            </p>
            <form onSubmit={createAccount} className="space-y-2.5">
              {[
                { k: "name", label: "Nama Lengkap", type: "text", required: true },
                { k: "email", label: "Email", type: "email", required: true },
                { k: "phone", label: "No. Telepon", type: "tel", required: false },
              ].map((f) => (
                <div key={f.k}>
                  <label className="text-xs font-bold text-accent">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={(form as any)[f.k]}
                    onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-accent">Password Awal</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Bagikan password ini ke kasir; mereka bisa menggantinya setelah login.
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-1 py-2 rounded-lg bg-accent text-accent-foreground font-bold shadow hover:opacity-90 transition disabled:opacity-60 text-sm"
              >
                {submitting ? "Menyimpan…" : "Buat Akun Kasir"}
              </button>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-card rounded-xl w-full max-w-sm p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-extrabold text-accent">Nonaktifkan Akun?</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Akun <strong className="text-accent">{confirmDelete.name}</strong> ({confirmDelete.email}) akan dinonaktifkan dan tidak bisa login lagi.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg bg-secondary text-accent text-sm font-semibold hover:opacity-90"
              >
                Batal
              </button>
              <button
                onClick={confirmRemove}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-bold hover:opacity-90 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Nonaktifkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
