import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Package, History, Settings as SettingsIcon, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import logo from "@/assets/pos-logo.jpeg";
import { actions, useStore } from "@/lib/pos-store";
import { auth, logout } from "@/lib/pos-api";

const navMain = [
  { to: "/pos", label: "Beranda", icon: Home },
];

const productSub = [
  { to: "/pos/products", label: "Daftar Produk" },
  { to: "/pos/categories", label: "Daftar Kategori" },
];

const navTail = [
  { to: "/pos/history", label: "Riwayat Transaksi", icon: History },
  { to: "/pos/settings", label: "Pengaturan", icon: SettingsIcon },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { loaded, loading, error } = useStore();
  const isProductSection = productSub.some((s) => pathname.startsWith(s.to));
  const [openSub, setOpenSub] = useState(isProductSection);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && !auth.isAuthed()) {
      nav({ to: "/" });
      return;
    }
    if (!loaded && !loading) actions.syncAll();
  }, [loaded, loading, nav]);

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [pathname]);

  async function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    await logout();
    nav({ to: "/" });
  }

  return (
    <div className="flex min-h-screen bg-pink-soft">
      {/* Top bar (always visible, contains toggle) */}
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
        <span className="w-8" />
      </header>

      {/* Backdrop (mobile only) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-40 top-14"
        />
      )}

      {/* Sidebar - slides from right to left on open */}
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
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-5 py-3 rounded-full font-semibold transition ${
                  active ? "bg-maroon text-primary-foreground" : "text-maroon hover:bg-secondary"
                }`}
              >
                <Icon size={20} /> {item.label}
              </Link>
            );
          })}

          <button
            onClick={() => setOpenSub((v) => !v)}
            className={`w-full flex items-center justify-between px-5 py-3 rounded-full font-semibold transition ${
              isProductSection ? "bg-accent text-maroon" : "text-maroon hover:bg-secondary"
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
                  <Link
                    key={s.to}
                    to={s.to}
                    className={`block px-4 py-2 rounded-lg text-sm transition ${
                      active ? "text-maroon font-bold" : "text-maroon/80 hover:text-maroon"
                    }`}
                  >
                    {s.label}
                  </Link>
                );
              })}
            </div>
          )}

          {navTail.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-5 py-3 rounded-full font-semibold transition ${
                  active ? "bg-maroon text-primary-foreground" : "text-maroon hover:bg-secondary"
                }`}
              >
                <Icon size={20} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <a
            href="/"
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-3 rounded-full text-maroon hover:bg-secondary text-sm font-semibold cursor-pointer"
          >
            <LogOut size={18} /> Keluar
          </a>
        </div>
      </aside>

      <main className={`flex-1 min-w-0 pt-14 transition-[margin] duration-300 ${sidebarOpen ? "lg:ml-72" : "ml-0"}`}>
        {error && (
          <div className="mx-4 mt-4 bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-2.5 border border-destructive/30">
            Gagal memuat data dari server: {error}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
