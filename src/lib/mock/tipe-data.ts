/**
 * ============================================================================
 * TIPE DATA — Acuan Skema Database (Backend Reference)
 * ============================================================================
 * File ini berisi definisi TypeScript untuk semua entitas yang dipakai
 * aplikasi. Nama kolom & tipe data di sini DICOCOKKAN dengan tabel Supabase
 * agar developer backend tinggal mengikuti.
 *
 * Jika backend belum siap, aplikasi memakai data contoh di `data-contoh.ts`.
 * Setelah backend siap, cukup hapus data contoh — interface ini tetap dipakai.
 * ============================================================================
 */

// ---------------------------------------------------------------------------
// Tabel: categories  (kategori produk bunga)
// ---------------------------------------------------------------------------
export interface Kategori {
  id: string;           // uuid / text — primary key
  name: string;         // nama kategori, contoh: "Bunga", "Wrapping"
}

// ---------------------------------------------------------------------------
// Tabel: products  (master produk yang dijual di kasir)
// ---------------------------------------------------------------------------
export interface Produk {
  id: string;           // uuid / text — primary key
  name: string;         // nama produk, contoh: "Mawar Merah"
  price: number;        // harga jual per unit (Rupiah)
  unit: string;         // satuan: "tangkai" | "ikat" | "lembar" | "pcs" | "meter"
  categoryId: string;   // FK → categories.id  (kolom DB: category_id)
  image: string;        // URL foto produk        (kolom DB: image_url)
  stock?: number;       // stok tersedia (opsional, untuk pengingat restock)
}

// ---------------------------------------------------------------------------
// Tabel: transactions  (kepala struk / nota)
// ---------------------------------------------------------------------------
export interface Transaksi {
  id: string;                       // uuid — primary key
  receipt_no?: string;              // nomor struk auto, format GB-YYYYMMDD-XXXX
  date: string;                     // ISO timestamp (kolom DB: created_at)
  customer: string;                 // nama pelanggan
  method: "Tunai" | "QRIS";         // metode pembayaran
  items: ItemTransaksi[];           // relasi → transaction_items
  subtotal: number;                 // total sebelum bayar (kolom: total_amount)
  paid: number;                     // uang yang dibayar    (kolom: paid_amount)
  change: number;                   // kembalian            (kolom: change_amount)
  cashier_name?: string;            // nama kasir yang melayani
}

// ---------------------------------------------------------------------------
// Tabel: transaction_items  (detail baris produk pada satu transaksi)
// ---------------------------------------------------------------------------
export interface ItemTransaksi {
  name: string;         // nama produk saat dijual (kolom: product_name)
  qty: number;          // jumlah
  price: number;        // harga per unit saat dijual (snapshot)
  unit: string;         // satuan saat dijual
  // subtotal = qty * price (dihitung di backend / frontend)
}

// ---------------------------------------------------------------------------
// Tabel: app_settings  (pengaturan toko — singleton, hanya 1 baris)
// ---------------------------------------------------------------------------
export interface PengaturanAplikasi {
  id: "singleton";          // selalu bernilai "singleton"
  event_name: string;       // nama event / nama toko ditampilkan di kasir
  owner_address: string;    // alamat pemilik (untuk struk & laporan)
  owner_phone: string;      // nomor telepon pemilik
  updated_at: string;       // ISO timestamp
}

// ---------------------------------------------------------------------------
// Tabel: cashier_audits  (audit selisih kas per kasir per event)
// ---------------------------------------------------------------------------
export interface AuditKasir {
  id: string;
  cashier_name: string;     // nama kasir
  event_date: string;       // tanggal event (YYYY-MM-DD)
  expected_cash: number;    // kas yang seharusnya (dari sistem)
  actual_cash: number;      // kas riil saat hitung manual
  notes?: string;           // catatan kasir
  // selisih = actual_cash - expected_cash  (dihitung di frontend)
}

// ---------------------------------------------------------------------------
// Tabel: users  (akun pengguna aplikasi)
// ---------------------------------------------------------------------------
export interface Pengguna {
  id: string;
  name: string;
  email: string;
  role: "owner" | "kasir";  // owner = admin penuh, kasir = hanya POS
  created_at: string;
}