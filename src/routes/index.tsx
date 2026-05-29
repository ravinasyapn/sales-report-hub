import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { PillInput } from "@/components/PillInput";
import { PasswordInput } from "@/components/PasswordInput";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Masuk — Gurita Bouquet" },
      { name: "description", content: "Masuk ke akun Gurita Bouquet." },
    ],
  }),
  component: LoginPage,
});

// Admin/owner credentials — login dengan email ini akan diarahkan ke panel admin
const ADMIN_EMAILS = ["owner@gurita.com", "admin@gurita.com"];
const ADMIN_PASSWORD = "admin123";

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    const id = identifier.trim().toLowerCase();
    if (ADMIN_EMAILS.includes(id)) {
      if (password !== ADMIN_PASSWORD) {
        toast.error("Password admin salah");
        return;
      }
      sessionStorage.setItem("gb_admin", "1");
      sessionStorage.setItem("gb_admin_role", "user");
      const ownerData = { name: "Owner", email: id, role: "owner" };
      localStorage.setItem("user-data", JSON.stringify(ownerData));
      localStorage.setItem("user", JSON.stringify(ownerData));
      window.dispatchEvent(new Event("gb-role-changed"));
      toast.success("Selamat datang, Owner!");
      navigate({ to: "/admin" });
      return;
    }
    sessionStorage.removeItem("gb_admin");
    const kasirData = { name: identifier.trim() || "Kasir", email: id, role: "kasir" };
    localStorage.setItem("user-data", JSON.stringify(kasirData));
    localStorage.setItem("user", JSON.stringify(kasirData));
    toast.success("Selamat datang, Kasir!");
    navigate({ to: "/pos" });
  };

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="space-y-6">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-center text-accent">
          Silahkan Masuk!
        </h1>

        <div className="space-y-2">
          <label className="text-sm font-bold text-accent">Email / No. Telepon</label>
          <PillInput
            placeholder="Masukan email atau nomor telepon kamu"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-accent">Password</label>
          <PasswordInput
            placeholder="Masukan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-semibold text-accent hover:underline">
              Lupa Password?
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full bg-primary px-16 py-3 text-base font-bold text-primary-foreground shadow-md hover:opacity-90 transition"
          >
            Masuk
          </button>
          <p className="text-sm font-semibold text-accent">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Daftar
            </Link>
          </p>
          <p className="text-[11px] text-accent/60 text-center max-w-xs">
            Admin/Owner login: <span className="font-mono">owner@gurita.com</span> /{" "}
            <span className="font-mono">admin123</span>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
