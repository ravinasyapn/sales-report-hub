import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Lupa Password — Gurita Bouquet" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  return (
    <AuthLayout>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email) return;
          toast.success("Tautan reset password telah dikirim ke email kamu");
          navigate({ to: "/reset-password" });
        }}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-pink-soft flex items-center justify-center text-maroon">
            <Mail size={22} />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl font-extrabold text-maroon">Lupa Password?</h2>
          <p className="text-sm text-pink-deep">
            Masukkan email akunmu untuk menerima tautan reset password.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-maroon">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukan email kamu"
            className="input-pill"
            required
          />
        </div>

        <div className="flex flex-col items-center gap-3 pt-1">
          <button type="submit" className="w-full btn-olive py-3 text-base font-bold">
            Kirim Tautan
          </button>
          <Link to="/" className="text-sm font-bold text-maroon hover:underline">
            Kembali ke Masuk
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
