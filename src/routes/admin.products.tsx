import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, PackagePlus, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Tambah Produk Bunga — Gurita Bouquet" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div className="p-5 sm:p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-accent/70 hover:text-accent">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      <header className="space-y-2">
        <div className="text-[10px] uppercase tracking-[0.22em] font-bold text-accent/70">Katalog</div>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-extrabold text-accent leading-tight">
          Tambah Produk Bunga
        </h1>
        <p className="text-sm text-foreground/70">
          Tambahkan varian bunga & bouquet baru. Produk akan tampil di POS Katalog kasir.
        </p>
      </header>

      <div className="rounded-3xl bg-card border border-border p-8 sm:p-12 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto flex items-center justify-center">
          <PackagePlus className="w-7 h-7 text-accent" />
        </div>
        <h2 className="font-serif italic text-2xl font-extrabold text-accent">Form Produk akan segera hadir</h2>
        <p className="text-sm text-foreground/70 max-w-md mx-auto">
          Untuk sementara, tambahkan produk langsung dari aplikasi POS Kasir di bagian katalog.
        </p>
        <a
          href="/pos"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition"
        >
          <Sparkles className="w-4 h-4" /> Buka POS Katalog
        </a>
      </div>
    </div>
  );
}
