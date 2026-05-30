# Struktur Frontend — Admin vs POS

Project ini punya **dua** frontend yang sengaja dipisah:

```
src/
├─ routes/
│  ├─ index.tsx               ← Login (publik)
│  ├─ forgot-password.tsx     ← Lupa password (publik)
│  ├─ reset-password.tsx
│  ├─ register.tsx
│  │
│  ├─ admin.tsx               ← Layout panel admin (Owner)
│  ├─ admin.index.tsx
│  ├─ admin.products.tsx
│  ├─ admin.reports.tsx
│  ├─ admin.accounts.tsx
│  ├─ admin.settings.tsx      ← Sumber kebenaran setting toko
│  ├─ admin.user.tsx
│  ├─ admin.login.tsx
│  │
│  ├─ pos.tsx                 ← Layout Kasir POS (Owner & Kasir)
│  ├─ pos.index.tsx           ← Halaman kasir (catalog + cart)
│  ├─ pos.products.tsx        ← Owner: CRUD. Kasir: read-only
│  ├─ pos.categories.tsx      ← Owner: CRUD. Kasir: read-only
│  ├─ pos.history.tsx
│  └─ pos.settings.tsx        ← Mirror dari admin.settings (read-only utk kasir)
│
├─ components/
│  ├─ AuthLayout.tsx          ← Bingkai login/forgot
│  └─ pos/
│     └─ PosShell.tsx         ← Sidebar + topbar Kasir POS
│
└─ lib/
   └─ pos/                    ← Semua logika POS dikumpulkan di sini
      ├─ api.ts               ← HTTP client ke backend Laravel
      ├─ store.ts             ← Reactive store + role helper
      ├─ dummy.ts             ← Data contoh bila backend offline
      └─ index.ts             ← Barrel: `import { ... } from "@/lib/pos"`
```

## Peran (Role)

Setelah login (`/`), localStorage diisi `user-data = { role: "owner" | "kasir" }`.

- **owner** (`owner@gurita.com` / `admin123`) → diarahkan ke `/admin`,
  bebas CRUD di POS, bisa edit pengaturan.
- **kasir** (email lainnya) → diarahkan ke `/pos`, hanya **lihat** produk
  & kategori, hanya boleh memproses transaksi & lihat pengaturan.
