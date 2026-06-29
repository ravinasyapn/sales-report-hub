import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import { ROLE_KEY } from "@/hooks/use-admin-role";

export const Route = createFileRoute("/admin/user")({
  head: () => ({ meta: [{ title: "Admin User — Gurita Bouquet" }] }),
  component: AdminUserPage,
});

function AdminUserPage() {
  const navigate = useNavigate();
  const goKasir = () => {
    sessionStorage.setItem(ROLE_KEY, "kasir");
    window.dispatchEvent(new Event("gb-role-changed"));
    navigate({ to: "/admin" });
  };
  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
      <div>
        <button
          type="button"
          onClick={goKasir}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent/70 hover:text-accent transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Admin Kasir
        </button>
      </div>

      <header className="space-y-3">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">
          Modul Admin User
        </div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-[1.05] tracking-tight">
          Bukan ranah operasional kasir.
        </h1>
      </header>

      <div className="rounded-3xl bg-gradient-to-br from-[var(--brand-cream)] to-secondary border border-border p-6 sm:p-10 shadow-[var(--shadow-card)]">
        <div className="flex gap-4 sm:gap-5 items-start">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-3">
            <h2 className="font-serif italic text-2xl sm:text-3xl font-extrabold text-accent leading-tight">
              Catatan Penelitian
            </h2>
            <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">
              Modul ini dikembangkan secara independen oleh{" "}
              <b>Anida Puspita Wandari</b> sebagai bagian dari ruang lingkup
              penelitian Penulisan Ilmiah terpisah, menggunakan basis data pusat
              (
              <code className="px-1.5 py-0.5 rounded bg-card text-xs font-mono">
                gurita_bouquett
              </code>
              ) yang sama.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
