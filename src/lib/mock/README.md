# 📦 Folder `src/lib/mock/`

Folder ini berisi **acuan struktur data** dan **data contoh** untuk pengembangan
frontend sebelum backend siap.

## File

| File | Fungsi |
| --- | --- |
| `tipe-data.ts` | Definisi TypeScript interface untuk semua tabel database. Jadi acuan developer backend. |
| `data-contoh.ts` | Data dummy yang dipakai aplikasi saat backend tidak tersedia (fallback otomatis). |

## Cara mengganti ke backend asli

1. Pastikan endpoint REST/Supabase Anda mengembalikan data dengan **nama kolom
   yang sama** seperti di `tipe-data.ts`.
2. Buka `src/lib/kasir/api.ts` dan ganti `API_BASE` ke URL backend Anda.
3. Saat backend berhasil dipanggil, aplikasi otomatis **berhenti memakai
   data contoh** (lihat `src/lib/kasir/penyimpanan.ts` → `actions.syncAll()`).

## Catatan

Data di `data-contoh.ts` **hanya** muncul jika request ke backend mengembalikan
array kosong. Setelah backend mengirim data asli, tampilan otomatis pakai data
asli — tidak perlu hapus file ini.