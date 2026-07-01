/**
 * ============================================================================
 * CANGKANG KASIR (PosShell) — Layout utama halaman Kasir POS
 * ============================================================================
 * Membungkus seluruh halaman di bawah route `/pos/*`. Berisi:
 *   - Header atas (logo + nama kasir + tombol toggle sidebar)
 *   - Sidebar kiri (menu Beranda, Manajemen Produk, Riwayat, Pengaturan)
 *   - Tombol "Kembali ke Admin" (hanya muncul untuk role owner)
 *   - Tombol Keluar (logout)
 *
 * Komponen anak ditaruh di `<main>` melalui prop `children`.
 * ============================================================================
 */
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Package, History, Settings as SettingsIcon, ChevronDown, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import logo from "@/assets/pos-logo.jpeg";
import { actions, useStore, getCurrentUser, isOwner } from "@/lib/kasir";
import { logout } from "@/lib/kasir";

const navMain = [{ to: "/pos", label: "Beranda", icon: Home }];
const productSub = [
  { to: "/pos/products", label: "Daftar Produk" },
  { to: "/pos/categories", label: "Daftar Kategori" },
];
const navTail = [
  { to: "/pos/history", label: "Riwayat Transaksi", icon: History },
  { to: "/pos/settings", label: "Pengaturan", icon: SettingsIcon },
];

export function PosShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { loaded, loading, error, usingDummy } = useStore();
  const isProductSection = productSub.some((s) => pathname.startsWith(s.to));
  const [openSub, setOpenSub] = useState(isProductSection);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const owner = isOwner();
  const user = getCurrentUser();

  useEffect(() => { if (!loaded && !loading) actions.syncAll(); }, [loaded, loading]);
  useEffect(() => { if (typeof window !== "undefined" && window.innerWidth < 1024) setSidebarOpen(false); }, [pathname]);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    await logout();
    try { localStorage.removeItem("user-data"); localStorage.removeItem("user"); } catch {}
    nav({ to: "/" });
  }

  return (
    <div className="flex min-h-screen bg-pink-soft">
      <header className="fixed top-0 inset-x-0 h-14 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="text-maroon p-2 -ml-2 rounded-lg hover:bg-secondary transition"
          aria-label={sidebarOpen ? "Tutup menu" : "Buka menu"}
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="flex items-center gap-2">
          <img src={logo} alt="" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-display text-maroon font-bold">GURITA BOUQUET.</span>
        </div>
        <span className="text-xs text-maroon/70 hidden sm:inline pr-2">
          {user.name || "Tamu"} · <b className="capitalize">{user.role || "kasir"}</b>
        </span>
      </header>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-black/40 z-40 top-14" />
      )}

      <aside
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-72 shrink-0 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navMain.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-5 py-3 rounded-full font-semibold transition ${
                  active ? "bg-maroon text-primary-foreground" : "text-maroon hover:bg-secondary"
                }`}
              ><Icon size={20} /> {item.label}</Link>
            );
          })}

          <button onClick={() => setOpenSub((v) => !v)}
            className={`w-full flex items-center justify-between px-5 py-3 rounded-full font-semibold transition ${
              isProductSection ? "bg-maroon text-primary-foreground" : "text-maroon hover:bg-secondary"
            }`}
          >
            <span className="flex items-center gap-3"><Package size={20} /> Manajemen Produk</span>
            <ChevronDown size={18} className={`transition ${openSub ? "rotate-180" : ""}`} />
          </button>
          {openSub && (
            <div className="pl-6 space-y-1">
              {productSub.map((s) => {
                const active = pathname === s.to;
                return (
                  <Link key={s.to} to={s.to}
                    className={`block px-4 py-2 rounded-lg text-sm transition ${
                      active ? "text-maroon font-bold" : "text-maroon/80 hover:text-maroon"
                    }`}
                  >{s.label}</Link>
                );
              })}
            </div>
          )}

          {navTail.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-5 py-3 rounded-full font-semibold transition ${
                  active ? "bg-maroon text-primary-foreground" : "text-maroon hover:bg-secondary"
                }`}
              ><Icon size={20} /> {item.label}</Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          {owner && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-5 py-3 rounded-full text-maroon hover:bg-secondary text-sm font-semibold transition"
            >
              <ArrowLeft size={18} /> Kembali ke Admin
            </Link>
          )}
          <a href="/" onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3 rounded-full text-maroon hover:bg-secondary text-sm font-semibold cursor-pointer">
            <LogOut size={18} /> Keluar
          </a>
        </div>
      </aside>

      <main className={`flex-1 min-w-0 pt-14 transition-[margin] duration-300 ${sidebarOpen ? "lg:ml-72" : "ml-0"}`}>
        {usingDummy && null}

        {error && !usingDummy && (
          <div className="mx-4 mt-4 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-2.5 border border-destructive/30">
            Gagal memuat data dari server: {error}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
