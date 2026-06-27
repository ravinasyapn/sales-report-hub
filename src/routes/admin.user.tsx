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
  Users,
  ShieldCheck,
  CalendarPlus,
  FileBarChart,
  ExternalLink,
  Flower2,
  LogOut,
  Menu,
  X,
  MoreVertical,
  UserCog,
  Wallet,
  Check,
} from "lucide-react";
import logo from "../assets/gurita-logo.png";
import { ROLE_KEY } from "@/hooks/use-admin-role";

export const Route = createFileRoute("/admin/user")({
  head: () => ({ meta: [{ title: "Admin User — Gurita Bouquet" }] }),
  component: AdminUserLayout,
});

const PUBLIC_LINKS = [
  { label: "Home", href: "/" },
  { label: "Workshop", href: "/#workshop" },
  { label: "Volunteer Apply", href: "/#volunteer" },
  { label: "SnK", href: "/#snk" },
  { label: "Contact", href: "/#contact" },
];

const USER_LINKS = [
  { to: "/admin/user", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/admin/user/peserta", label: "Data Peserta", icon: Users },
  { to: "/admin/user/volunteer", label: "Verifikasi Volunteer", icon: ShieldCheck },
  { to: "/admin/user/events", label: "Tambah Event", icon: CalendarPlus },
  { to: "/admin/user/reports", label: "Laporan Event", icon: FileBarChart },
] as const;

function AdminUserLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMobileOpen(false), [path]);
  useEffect(() => {
    if (!roleOpen) return;
    const onDown = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) setRoleOpen(false);
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

  const chooseKasir = () => {
    sessionStorage.setItem(ROLE_KEY, "kasir");
    window.dispatchEvent(new Event("gb-role-changed"));
    setRoleOpen(false);
    navigate({ to: "/admin" });
  };

  const Sidebar = (
    <aside
      className="h-full w-72 shrink-0 flex flex-col text-[#FCE4EC]/90"
      style={{ background: "var(--maroon)" }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-serif italic text-2xl font-extrabold text-white leading-tight">
            Gurita Bouquet
          </div>
          <div className="text-[10px] tracking-[0.22em] font-bold text-white/60 uppercase mt-1">
            Admin Console
          </div>
        </div>
        <div className="relative" ref={popRef}>
          <button
            onClick={() => setRoleOpen((v) => !v)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
            aria-label="Pilih role"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {roleOpen && (
            <div className="absolute right-0 top-9 z-50 w-56 rounded-2xl bg-card text-foreground shadow-xl border border-border overflow-hidden">
              <div className="px-3 py-2 text-[10px] uppercase tracking-[0.16em] font-bold text-foreground/50 bg-secondary/40">
                Pilih Role
              </div>
              <button
                onClick={() => { setRoleOpen(false); navigate({ to: "/admin/user" }); }}
                className="w-full text-left px-3 py-3 flex items-start gap-3 bg-secondary/60"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary text-accent flex items-center justify-center shrink-0">
                  <UserCog className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-accent flex items-center gap-1.5">
                    Admin User <Check className="w-3.5 h-3.5 text-accent/70" />
                  </div>
                  <div className="text-[11px] text-foreground/60 truncate">Modul penelitian</div>
                </div>
              </button>
              <button
                onClick={chooseKasir}
                className="w-full text-left px-3 py-3 flex items-start gap-3 hover:bg-secondary/40"
              >
                <div className="w-9 h-9 rounded-xl bg-secondary text-accent flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-accent">Admin Kasir</div>
                  <div className="text-[11px] text-foreground/60 truncate">Operasional & laporan</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4">
        <div className="rounded-full bg-white/10 border border-white/15 px-4 py-2.5 flex items-center gap-2.5">
          <UserCog className="w-4 h-4 text-white" />
          <span className="text-xs font-bold tracking-[0.18em] uppercase text-white">
            Admin User
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 mt-4 pb-3 space-y-5">
        <div className="space-y-1.5">
          {USER_LINKS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-full font-semibold text-sm transition ${
                  active
                    ? "bg-white/15 text-white shadow-inner"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-white/15 pt-4">
          <div className="px-4 pb-2 flex items-center gap-2">
            <Flower2 className="w-3.5 h-3.5 text-white/60" />
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/60">
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
                className="group flex items-center gap-3 px-4 py-2.5 rounded-full text-sm text-white/75 hover:bg-white/10 hover:text-white transition"
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
        className="m-3 flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
      >
        <LogOut className="w-4 h-4" /> Keluar
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <button
            className="absolute top-4 right-4 z-50 text-white/80 p-2 rounded-full hover:bg-white/10"
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
            ADMIN USER
          </span>
          <img src={logo} alt="Gurita" className="w-7 h-7 rounded-full object-cover ml-auto" />
        </header>
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
