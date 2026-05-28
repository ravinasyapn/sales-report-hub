import { Info } from "lucide-react";

export function ResearchModuleBanner() {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex gap-3 items-start">
      <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
        <Info className="w-4 h-4" />
      </div>
      <p className="text-sm text-accent leading-relaxed">
        Modul ini dikembangkan secara independen oleh{" "}
        <b>Anida Puspita Wandari</b> sebagai bagian dari ruang lingkup
        penelitian Penulisan Ilmiah terpisah, menggunakan basis data pusat
        (<code className="px-1.5 py-0.5 rounded bg-card text-xs font-mono">gurita_bouquett</code>)
        yang sama.
      </p>
    </div>
  );
}
