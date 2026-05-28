import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { PillInput } from "@/components/PillInput";

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
          if (email) navigate({ to: "/reset-password" });
        }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-extrabold text-center text-accent">Lupa Password?</h1>
        <p className="text-center text-sm text-muted-foreground">
          Masukkan email akunmu untuk menerima tautan reset password.
        </p>
        <div className="space-y-2">
          <label className="text-sm font-bold text-accent">Email</label>
          <PillInput
            type="email"
            placeholder="Masukan email kamu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col items-center gap-3 pt-2">
          <button className="rounded-full bg-primary px-12 py-3 font-bold text-primary-foreground shadow-md hover:opacity-90">
            Kirim Tautan
          </button>
          <Link to="/" className="text-sm font-semibold text-accent hover:underline">
            Kembali ke Masuk
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
