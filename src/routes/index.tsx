import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { login } from "@/lib/kasir";
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

function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password || loading) return;

    setLoading(true);
    try {
      // Login asli ke backend Laravel (/api/login). Token disimpan otomatis oleh auth.set().
      const user = await login({ email: identifier.trim(), password });
      const role: "owner" | "kasir" = user?.role === "owner" ? "owner" : "kasir";
      const data = {
        name: user?.name || "Pengguna",
        email: user?.email || identifier.trim(),
        role,
      };
      localStorage.setItem("user-data", JSON.stringify(data));
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("gb-role-changed"));

      if (role === "owner") {
        sessionStorage.setItem("gb_admin", "1");
        sessionStorage.removeItem("gb_admin_role"); // selalu mulai dari layar "Selamat Datang"
        toast.success("Selamat datang, Owner!");
        navigate({ to: "/admin" });
      } else {
        sessionStorage.removeItem("gb_admin");
        toast.success(`Selamat datang, ${data.name}!`);
        navigate({ to: "/pos" });
      }
    } catch (err: any) {
      toast.error(err?.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="space-y-6">
        <h2 className="font-display text-4xl font-extrabold text-center text-maroon">
          Silahkan Masuk!
        </h2>

        <div className="space-y-2">
          <label className="text-sm font-bold text-maroon">Email</label>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Masukan email kamu"
            className="input-pill"
            type="email"
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
          <button type="submit" disabled={loading} className="w-full btn-olive py-3 text-base font-bold disabled:opacity-50">
            {loading ? "Memproses..." : "Masuk"}
          </button>
          <div className="text-[11px] text-maroon/60 text-center space-y-0.5">
            <p>Owner: <span className="font-mono">owner@gurita.com</span> / <span className="font-mono">admin123</span></p>
            <p>Kasir: <span className="font-mono">kasir@gurita.com</span> / <span className="font-mono">kasir123</span></p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
}

