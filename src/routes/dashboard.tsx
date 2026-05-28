import { createFileRoute, Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Package, History, Settings, ChevronDown, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Gurita Bouquet" }] }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const [productOpen, setProductOpen] = useState(true);

  const isActive = (p: string) => path === p;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-5 border-b border-border flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <BrandLogo className="w-10 h-10 object-contain" />
          </div>
          <span className="font-extrabold text-accent tracking-wide">GURITA BOUQUET.</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 text-accent">
          <NavItem to="/dashboard" icon={Home} label="Beranda" active={isActive("/dashboard")} />

          <button
            onClick={() => setProductOpen((o) => !o)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold hover:bg-secondary transition ${
              productOpen ? "bg-secondary" : ""
            }`}
          >
            <span className="flex items-center gap-3">
              <Package className="w-5 h-5" /> Manajemen Produk
            </span>
            <ChevronDown className={`w-4 h-4 transition ${productOpen ? "rotate-180" : ""}`} />
          </button>
          {productOpen && (
            <div className="ml-10 space-y-1 text-sm">
              <Link to="/dashboard" className="block py-2 hover:text-primary">Point of Sale</Link>
              <Link to="/dashboard" className="block py-2 hover:text-primary">Daftar Produk</Link>
              <Link to="/dashboard" className="block py-2 hover:text-primary">Stok</Link>
            </div>
          )}

          <NavItem to="/dashboard" icon={History} label="Riwayat Transaksi" active={false} />
          <NavItem to="/dashboard" icon={Settings} label="Pengaturan" active={false} />
        </nav>

        <button
          onClick={() => navigate({ to: "/" })}
          className="m-3 flex items-center gap-3 px-4 py-3 rounded-xl text-accent font-semibold hover:bg-secondary"
        >
          <LogOut className="w-5 h-5" /> Keluar
        </button>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({
  to, icon: Icon, label, active,
}: { to: string; icon: typeof Home; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
        active ? "bg-accent text-accent-foreground" : "hover:bg-secondary"
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}
