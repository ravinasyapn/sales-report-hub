import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  LayoutGrid,
  FileBarChart,
  Users,
  Settings,
  Flower2,
  ExternalLink,
  Wallet,
  LogOut,
  Menu,
  X,
  MoreVertical,
  UserCog,
  Check,
  ShieldCheck,
} from "lucide-react";
import logo from "@/assets/gurita-logo.png";
import { useAdminRole, ROLE_KEY } from "@/hooks/use-admin-role";

export { useAdminRole };

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Gurita Bouquet" }] }),
  component: AdminLayout,
});

const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "Workshop", href: "/#workshop" },
  { label: "Volunteer Apply", href: "/#volunteer" },
  { label: "SnK", href: "/#snk" },
  { label: "Contact", href: "/#contact" },
];

const KASIR_LINKS = [
  { to: "/admin", label: "Dashboard", icon: ShieldCheck, exact: true },
  { to: "/admin/reports", label: "Laporan Penjualan", icon: FileBarChart },
  { to: "/admin/accounts", label: "Manajemen Akun", icon: Users },
  { to: "/admin/settings", label: "Setting", icon: Settings },
];

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [role, setRole] = useAdminRole();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("gb_admin")) {
      navigate({ to: "/" });
    }
  }, [path, navigate]);

  useEffect(() => setMobileOpen(false), [path]);

  useEffect(() => {
    if (!roleOpen) return;
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [roleOpen]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const logout = () => {
    sessionStorage.removeItem("gb_admin");
    sessionStorage.removeItem(ROLE_KEY);
    navigate({ to: "/" });
  };

  const chooseUser = () => {
    setRole("user");
    setRoleOpen(false);
    navigate({ to: "/admin/user" });
  };
  const chooseKasir = () => {
    setRole("kasir");
    setRoleOpen(false);
    navigate({ to: "/admin" });
  };

  const activeRoleLabel =
    path.startsWith("/admin/user") || role === "user"
      ? "Admin User"
      : "Admin Kasir";
  const showKasirNav = role === "kasir" && !path.startsWith("/admin/user");

  const Sidebar = (
    <aside className="h-full w-72 shrink-0 bg-card flex flex-col border-r border-border">
      {/* Brand card */}
      <div className="px-4 pt-5">
        <div className="relative rounded-2xl bg-secondary/70 border border-border px-4 py-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
            <img src={logo} alt="Gurita" className="w-9 h-9 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-extrabold text-accent text-[15px] leading-tight tracking-tight truncate">
              GURITA BOUQUET.
            </div>
            <div className="text-[10px] font-semibold tracking-[0.18em] text-accent/70 uppercase">
              Admin Panel
            </div>
          </div>
          <div className="relative" ref={popRef}>
            <button
              onClick={() => setRoleOpen((v) => !v)}
              className="p-1.5 rounded-full hover:bg-card/80 text-accent/70 hover:text-accent transition"
              aria-label="Pilih role"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {roleOpen && (
              <div className="absolute right-0 top-9 z-50 w-56 rounded-2xl bg-card text-foreground shadow-xl border border-border overflow-hidden">
                <div className="px-3 py-2 text-[10px] uppercase tracking-[0.16em] font-bold text-foreground/50 bg-secondary/40">
                  Pilih Role
                </div>
                <RoleOption
                  icon={UserCog}
                  label="Admin User"
                  desc="Modul penelitian"
                  active={activeRoleLabel === "Admin User"}
                  onClick={chooseUser}
                />
                <RoleOption
                  icon={Wallet}
                  label="Admin Kasir"
                  desc="Operasional & laporan"
                  active={activeRoleLabel === "Admin Kasir"}
                  onClick={chooseKasir}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 mt-4 pb-3 space-y-5">
        {showKasirNav && (
          <div className="space-y-1.5">
            {KASIR_LINKS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-full font-semibold text-sm transition ${
                    active
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "text-accent/85 hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {showKasirNav && (
          <div>
            <div className="px-4 pt-2 pb-2 flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-accent/60" />
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent/60">
                Kasir POS
              </span>
            </div>
            <Link
              to="/pos"
              className="group flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-accent/85 hover:bg-secondary/60 transition"
            >
              <Wallet className="w-[18px] h-[18px] shrink-0" />
              <span className="flex-1 truncate">Buka Kasir POS</span>
            </Link>
          </div>
        )}

        <div>
          <div className="px-4 pt-2 pb-2 flex items-center gap-2">
            <Flower2 className="w-3.5 h-3.5 text-accent/60" />
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-accent/60">
              Public Site
            </span>
          </div>
          <div className="space-y-1">
            {PUBLIC_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-accent/80 hover:bg-secondary/60 transition"
              >
                <span className="flex-1 truncate">{l.label}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </nav>

      <button
        onClick={logout}
        className="m-3 flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-accent/80 hover:bg-secondary/60 transition"
      >
        <LogOut className="w-[18px] h-[18px]" /> Keluar
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            className="absolute top-4 right-4 z-50 text-accent/70 p-2 rounded-full hover:bg-secondary"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
          {Sidebar}
        </div>
      </div>
      <div className="hidden lg:block sticky top-0 h-screen">{Sidebar}</div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-20 bg-card border-b border-border flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary text-accent"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-accent text-base tracking-tight">
            GURITA BOUQUET.
          </span>
        </header>
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function RoleOption({
  icon: Icon,
  label,
  desc,
  active,
  onClick,
}: {
  icon: typeof Users;
  label: string;
  desc: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-3 flex items-start gap-3 transition ${
        active ? "bg-secondary/60" : "hover:bg-secondary/40"
      }`}
    >
      <div className="w-9 h-9 rounded-xl bg-secondary text-accent flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-accent flex items-center gap-1.5">
          {label}
          {active && <Check className="w-3.5 h-3.5 text-accent/70" />}
        </div>
        <div className="text-[11px] text-foreground/60 truncate">{desc}</div>
      </div>
    </button>
  );
}
