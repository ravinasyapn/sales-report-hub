import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { PillInput } from "@/components/PillInput";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Daftar — Gurita Bouquet" },
      { name: "description", content: "Daftarkan akun baru Gurita Bouquet." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    password: "",
    konfirmasi: "",
  });
  const [error, setError] = useState("");

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.konfirmasi) {
      setError("Password tidak cocok");
      return;
    }
    setError("");
    navigate({ to: "/" });
  };

  return (
    <AuthLayout>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-center text-accent leading-tight">
          Silahkan Daftarkan
          <br />
          Akunmu!
        </h1>

        {[
          { k: "nama" as const, label: "Nama", placeholder: "Masukan nama lengkap kamu" },
          { k: "email" as const, label: "Email", placeholder: "Masukan email kamu", type: "email" },
          { k: "telepon" as const, label: "No. Telepon", placeholder: "Masukan nomor telepon kamu" },
          { k: "password" as const, label: "Password", placeholder: "Masukan password", type: "password" },
          { k: "konfirmasi" as const, label: "Konfirmasi Password", placeholder: "Masukan password", type: "password" },
        ].map((f) => (
          <div key={f.k} className="space-y-1.5">
            <label className="text-sm font-bold text-accent">{f.label}</label>
            <PillInput
              type={f.type ?? "text"}
              placeholder={f.placeholder}
              value={form[f.k]}
              onChange={update(f.k)}
              required
            />
          </div>
        ))}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}

        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="submit"
            className="rounded-full bg-primary px-16 py-3 text-base font-bold text-primary-foreground shadow-md hover:opacity-90 transition"
          >
            Daftar
          </button>
          <p className="text-sm font-semibold text-accent">
            Sudah punya akun?{" "}
            <Link to="/" className="text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
