/*import { createFileRoute } from "@tanstack/react-router";
import { PosShell } from "@/components/PosShell";
import { useStore, actions } from "@/lib/pos-store";
import { Layers } from "lucide-react";

export const Route = createFileRoute("/pos/stock")({ component: Stock });

function Stock() {
  const { products, categories } = useStore();
  return (
    <PosShell>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon flex items-center gap-2"><Layers /> Stok</h1>
          <p className="text-maroon/70 text-sm mt-1">Pantau & sesuaikan stok produk</p>
        </div>

        <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-maroon">
              <tr>
                <th className="text-left p-4">Produk</th>
                <th className="text-left p-4">Kategori</th>
                <th className="text-left p-4">Stok</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                const low = p.stock <= 10;
                return (
                  <tr key={p.id} className="border-t border-border text-maroon">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.image} className="h-10 w-10 rounded-lg object-cover" alt="" />
                      <span className="font-semibold">{p.name}</span>
                    </td>
                    <td className="p-3">{cat?.name}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={p.stock}
                        onChange={(e) => actions.updateProduct(p.id, { stock: parseInt(e.target.value) || 0 })}
                        className="input-pill w-24 py-1.5 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${p.stock === 0 ? "bg-destructive/15 text-destructive" : low ? "bg-pink-deep text-maroon" : "bg-olive text-maroon"}`}>
                        {p.stock === 0 ? "Habis" : low ? "Stok Rendah" : "Tersedia"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => actions.updateProduct(p.id, { stock: p.stock + 10 })} className="btn-maroon text-xs py-1.5 px-3">+10</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PosShell>
  );
}
*/