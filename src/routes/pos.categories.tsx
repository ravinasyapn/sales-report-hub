import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PosShell } from "@/components/kasir/CangkangKasir";
import { useStore, actions, isOwner, type Category } from "@/lib/kasir";
import { Plus, Pencil, Trash2, Boxes } from "lucide-react";

export const Route = createFileRoute("/pos/categories")({ component: Categories });

function Categories() {
  const { categories, products } = useStore();
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  // Kasir (volunteer) hanya melihat. Owner penuh.
  const currentUser = { role: isOwner() ? "owner" : "kasir" };

  return (
    <PosShell>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-maroon flex items-center gap-2"><Boxes /> Daftar Kategori</h1>
            <p className="text-maroon/70 text-sm mt-1">Atur kategori produk kamu</p>
          </div>
          
          {/* FIX 1: Tombol Tambah Kategori hanya muncul jika user adalah Owner */}
          {currentUser.role === 'owner' && (
            <button onClick={() => setOpenAdd(true)} className="btn-maroon flex items-center gap-2">
              <Plus size={18}/> Tambah Kategori
            </button>
          )}
        </div>

        <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
          {categories.map((c) => {
            const count = products.filter((p) => p.categoryId === c.id).length;
            const editing = editId === c.id;
            return (
              <div key={c.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                {editing ? (
                  <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} className="input-pill mr-3" />
                ) : (
                  <div>
                    <p className="font-semibold text-maroon">{c.name}</p>
                    <p className="text-xs text-maroon/60">{count} produk</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button onClick={async () => { try { await actions.updateCategory(c.id, editName); setEditId(null); } catch (e: any) { alert(e?.message ?? "Gagal menyimpan"); } }} className="btn-maroon py-1.5 px-4 text-xs">Simpan</button>
                      <button onClick={() => setEditId(null)} className="btn-olive py-1.5 px-4 text-xs">Batal</button>
                    </>
                  ) : (
                    <>
                      {/* FIX 2: Tombol Edit & Hapus Kategori hanya muncul jika user adalah Owner */}
                      {currentUser.role === 'owner' && (
                        <>
                          <button onClick={() => { setEditId(c.id); setEditName(c.name); }} className="text-maroon"><Pencil size={16}/></button>
                          <button onClick={() => setDeleteTarget(c)} className="text-destructive"><Trash2 size={16}/></button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {categories.length === 0 && (
            <p className="p-8 text-center text-maroon/60">
              Belum ada kategori. {currentUser.role === 'owner' && 'Klik "Tambah Kategori" untuk membuat baru.'}
            </p>
          )}
        </div>
      </div>

      {openAdd && <AddCategoryModal onClose={() => setOpenAdd(false)} />}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl p-6 w-full max-w-sm text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
              <Trash2 className="text-destructive" />
            </div>
            <h3 className="font-display text-xl font-bold text-maroon">Hapus Kategori?</h3>
            <p className="text-sm text-maroon/70 mt-2">
              Kategori <span className="font-semibold">"{deleteTarget.name}"</span> beserta semua produk di dalamnya akan dihapus.
            </p>
            <div className="flex gap-2 pt-5">
              <button onClick={() => setDeleteTarget(null)} className="btn-olive flex-1">Batal</button>
              <button
                onClick={async () => { try { await actions.deleteCategory(deleteTarget.id); setDeleteTarget(null); } catch (e: any) { alert(e?.message ?? "Gagal menghapus"); } }}
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

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try { await actions.addCategory(name.trim()); onClose(); }
    catch (e: any) { alert(e?.message ?? "Gagal menambah kategori"); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-card rounded-3xl p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-pink-soft flex items-center justify-center text-maroon">
            <Boxes size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-maroon">Tambah Kategori</h3>
            <p className="text-xs text-maroon/60">Buat kategori produk baru</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-maroon">Nama Kategori</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Bunga, Wrapping, Aksesoris" className="input-pill mt-1" required />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-olive flex-1">Batal</button>
          <button type="submit" className="btn-maroon flex-1">Simpan</button>
        </div>
      </form>
    </div>
  );
}