import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Masuk — Gurita Bouquet" },
      { name: "description", content: "Masuk ke akun Gurita Bouquet POS." },
    ],
  }),
  component: LoginPage,
});

// Owner credentials → diarahkan ke /admin; selain itu → role kasir → /pos
const ADMIN_EMAILS = ["owner@gurita.com", "admin@gurita.com"];
const ADMIN_PASSWORD = "admin123";

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;

    const id = identifier.trim().toLowerCase();
    if (ADMIN_EMAILS.includes(id)) {
      if (password !== ADMIN_PASSWORD) { toast.error("Password admin salah"); return; }
      const ownerData = { name: "Owner", email: id, role: "owner" };
      sessionStorage.setItem("gb_admin", "1");
      sessionStorage.setItem("gb_admin_role", "user");
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
        <h2 className="font-display text-4xl font-extrabold text-center text-maroon">
          Silahkan Masuk!
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-bold text-maroon">Email / No. Telepon</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Masukan email atau nomor telepon kamu"
            className="input-pill"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-maroon">Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukan password"
              className="input-pill pr-28"
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn-olive py-1.5 px-4 text-xs flex items-center gap-1"
            >
              {show ? <EyeOff size={12} /> : <Eye size={12} />}
              {show ? "Sembunyikan" : "Tampilkan"}
            </button>
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm font-bold text-pink-deep hover:underline">
              Lupa Password?
            </Link>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <button type="submit" className="w-full btn-olive py-3 text-base font-bold">
            Masuk
          </button>
          <p className="text-sm font-semibold text-maroon">
            Belum punya akun?{" "}
            <Link to="/register" className="text-pink-deep hover:underline">
              Daftar
            </Link>
          </p>
          <p className="text-[11px] text-maroon/60 text-center">
            Owner: <span className="font-mono">owner@gurita.com</span> /{" "}
            <span className="font-mono">admin123</span>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
