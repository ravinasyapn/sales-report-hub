import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { PasswordInput } from "@/components/PasswordInput";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — Gurita Bouquet" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");

  return (
    <AuthLayout>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw.length < 6) return setErr("Password minimal 6 karakter");
          if (pw !== pw2) return setErr("Password tidak cocok");
          setErr("");
          navigate({ to: "/" });
        }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-extrabold text-center text-accent">
          Masukkan password baru
        </h1>
        <div className="space-y-2">
          <label className="text-sm font-bold text-accent">Password</label>
          <PasswordInput
            placeholder="Masukan password baru"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-accent">Konfirmasi Password</label>
          <PasswordInput
            placeholder="Masukan kembali password baru"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
          />
        </div>
        {err && <p className="text-sm text-destructive text-center">{err}</p>}
        <div className="flex justify-center pt-2">
          <button className="rounded-full bg-primary px-12 py-3 font-bold text-primary-foreground shadow-md hover:opacity-90">
            Ubah Password
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
