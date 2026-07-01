import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PosShell } from "@/components/kasir/CangkangKasir";
import { useStore, actions, formatIDR, isOwner, type Product } from "@/lib/kasir";
import { Plus, Pencil, Trash2, Package, Search, ArrowDownAZ } from "lucide-react";

export const Route = createFileRoute("/pos/products")({ component: Products });
type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc";

function Products() {
  const { products, categories } = useStore();
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name-asc");
  // Kasir (volunteer) tetap boleh melihat halaman, tapi semua aksi CRUD disembunyikan
  const owner = isOwner();
  const currentUser = { role: owner ? "owner" : "kasir" };

  const filtered = products
    .filter((p) => {
      const cat = categories.find((c) => c.id === p.categoryId)?.name ?? "";
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (sort) {
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
      }
    });

  return (
    <PosShell>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-maroon flex items-center gap-2"><Package /> Daftar Produk</h1>
            <p className="text-maroon/70 text-sm mt-1">Kelola produk bunga & wrapping kamu</p>
          </div>
          
          {/* FIX 1: Sembunyikan Tombol "Tambah Produk" jika yang login adalah kasir */}
          {currentUser.role === 'owner' && (
            <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-maroon flex items-center gap-2">
              <Plus size={18}/> Tambah Produk
            </button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon/50 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-pill pl-12!"
              placeholder="Cari bunga atau wrapping..."
            />
          </div>
          <div className="relative">
            <ArrowDownAZ size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon/50 pointer-events-none" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="input-pill pl-12! pr-8 appearance-none cursor-pointer"
            >
              <option value="name-asc">Nama (A-Z)</option>
              <option value="name-desc">Nama (Z-A)</option>
              <option value="price-asc">Harga termurah</option>
              <option value="price-desc">Harga termahal</option>
            </select>
          </div>
        </div>

        <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-maroon">
              <tr>
                <th className="text-left p-4">Produk</th>
                <th className="text-left p-4">Kategori</th>
                <th className="text-left p-4">Harga</th>
                {/* FIX 2: Sembunyikan Header Aksi jika role-nya kasir */}
                {currentUser.role === 'owner' && <th className="text-right p-4">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="border-t border-border text-maroon">
                    <td className="p-3 flex items-center gap-3">
                      <img src={p.image} className="h-12 w-12 rounded-lg object-cover" alt="" />
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-maroon/60">per {p.unit}</p>
                      </div>
                    </td>
                    <td className="p-3">{cat?.name ?? "-"}</td>
                    <td className="p-3 font-semibold">{formatIDR(p.price)}</td>
                    
                    {/* FIX 3: Sembunyikan Tombol Edit & Hapus jika role-nya kasir */}
                    {currentUser.role === 'owner' && (
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => { setEditing(p); setOpen(true); }} className="inline-flex items-center gap-1 text-maroon hover:underline"><Pencil size={14}/></button>
                        <button onClick={() => setDeleteTarget(p)} className="inline-flex items-center gap-1 text-destructive hover:underline"><Trash2 size={14}/></button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {products.length === 0 && <tr><td colSpan={currentUser.role === 'owner' ? 4 : 3} className="p-8 text-center text-maroon/60">Belum ada produk.</td></tr>}
              {products.length > 0 && filtered.length === 0 && <tr><td colSpan={currentUser.role === 'owner' ? 4 : 3} className="p-8 text-center text-maroon/60">Tidak ada produk yang cocok.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {open && <ProductModal initial={editing} onClose={() => setOpen(false)} />}
      
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl p-6 w-full max-w-sm text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <Trash2 className="text-destructive" />
            </div>
            <h3 className="font-display text-xl font-bold text-maroon">Hapus Produk?</h3>
            <p className="text-sm text-maroon/70 mt-2">
              Produk <span className="font-semibold">"{deleteTarget.name}"</span> akan dihapus secara permanen.
            </p>
            <div className="flex gap-2 pt-5">
              <button onClick={() => setDeleteTarget(null)} className="btn-pink flex-1">Batal</button>
              <button
                onClick={async () => { try { await actions.deleteProduct(deleteTarget.id); setDeleteTarget(null); } catch (e: any) { alert(e?.message ?? "Gagal menghapus"); } }}
                className="flex-1 bg-destructive text-destructive-foreground rounded-full py-2.5 font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </PosShell>
  );
}

function ProductModal({ initial, onClose }: { initial: Product | null; onClose: () => void }) {
  const { categories } = useStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [unit, setUnit] = useState(initial?.unit ?? "tangkai");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [image, setImage] = useState(initial?.image ?? "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { 
      name, 
      price: parseInt(price) || 0, 
      unit, 
      categoryId, 
      image 
    };
    try {
      if (initial) await actions.updateProduct(initial.id, payload);
      else await actions.addProduct(payload);
      onClose();
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan produk");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-card rounded-3xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto scroll-pretty">
        <h3 className="font-display text-xl font-bold text-maroon">{initial ? "Edit" : "Tambah"} Produk</h3>
        <div><label className="text-sm font-semibold text-maroon">Nama</label><input className="input-pill mt-1" value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-sm font-semibold text-maroon">Harga</label><input className="input-pill mt-1" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} required /></div>
          <div><label className="text-sm font-semibold text-maroon">Satuan</label><input className="input-pill mt-1" value={unit} onChange={(e) => setUnit(e.target.value)} required /></div>
        </div>
        <div>
          <label className="text-sm font-semibold text-maroon">Kategori</label>
          <select className="input-pill mt-1" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label className="text-sm font-semibold text-maroon">URL Gambar</label><input className="input-pill mt-1" value={image} onChange={(e) => setImage(e.target.value)} /></div>
        <img src={image} alt="" className="w-full h-32 object-cover rounded-xl" />
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-pink flex-1">Batal</button>
          <button type="submit" className="btn-maroon flex-1">Simpan</button>
        </div>
      </form>
    </div>
  );
}