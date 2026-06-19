import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/wireframe")({
  head: () => ({ meta: [{ title: "Wireframe — Gurita Bouquet" }] }),
  component: WireframePage,
});

/* ============================================================
   Wireframe primitives — pure black & white, no color
   ============================================================ */

const wf = {
  page: "bg-white text-black font-mono",
  frame:
    "border-2 border-black bg-white mx-auto my-10 shadow-[6px_6px_0_0_#000]",
  caption:
    "text-[11px] uppercase tracking-[0.2em] text-black/70 mb-2 mt-12 text-center",
  title: "text-2xl font-bold text-center mb-1",
  box: "border border-black",
  boxD: "border border-dashed border-black",
  fill: "bg-black/10",
  fillD: "bg-black/5",
  label: "text-[10px] uppercase tracking-wider text-black/60",
};

function Line({ w = "60%", h = 8 }: { w?: string; h?: number }) {
  return (
    <div
      className="bg-black/70 rounded-sm"
      style={{ width: w, height: h, marginBottom: 6 }}
    />
  );
}

function Block({
  h = 60,
  label,
  dashed = false,
  className = "",
}: {
  h?: number;
  label?: string;
  dashed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`${dashed ? wf.boxD : wf.box} ${wf.fillD} flex items-center justify-center ${className}`}
      style={{ height: h }}
    >
      {label && <span className={wf.label}>{label}</span>}
    </div>
  );
}

function Btn({ children, w = 120 }: { children: React.ReactNode; w?: number }) {
  return (
    <div
      className="border border-black bg-black text-white text-[11px] uppercase tracking-wider px-3 py-2 inline-flex items-center justify-center"
      style={{ minWidth: w }}
    >
      {children}
    </div>
  );
}

function GhostBtn({
  children,
  w = 120,
}: {
  children: React.ReactNode;
  w?: number;
}) {
  return (
    <div
      className="border border-black bg-white text-black text-[11px] uppercase tracking-wider px-3 py-2 inline-flex items-center justify-center"
      style={{ minWidth: w }}
    >
      {children}
    </div>
  );
}

function Input({ label, w = "100%" }: { label: string; w?: string }) {
  return (
    <div style={{ width: w }} className="mb-3">
      <div className={`${wf.label} mb-1`}>{label}</div>
      <div className="border border-black h-9 bg-white" />
    </div>
  );
}

function Frame({
  title,
  subtitle,
  width = 1200,
  height,
  children,
}: {
  title: string;
  subtitle?: string;
  width?: number;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className={wf.caption}>{subtitle ?? "wireframe"}</div>
      <div className={wf.title}>{title}</div>
      <div
        className={wf.frame}
        style={{ width, maxWidth: "95vw", minHeight: height }}
      >
        {/* fake browser chrome */}
        <div className="border-b border-black flex items-center gap-2 px-3 py-2 bg-white">
          <div className="w-3 h-3 rounded-full border border-black" />
          <div className="w-3 h-3 rounded-full border border-black" />
          <div className="w-3 h-3 rounded-full border border-black" />
          <div className="ml-3 flex-1 h-5 border border-black bg-white" />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </section>
  );
}

/* ============================================================
   Individual screens
   ============================================================ */

function LoginWF() {
  return (
    <Frame title="01 · Login" subtitle="/  (auth)">
      <div className="grid grid-cols-2 gap-8 min-h-[460px]">
        <div className={`${wf.box} ${wf.fillD} flex items-center justify-center`}>
          <span className={wf.label}>Brand panel / Logo Gurita</span>
        </div>
        <div className="flex flex-col justify-center px-8">
          <Line w="40%" h={18} />
          <Line w="70%" h={10} />
          <div className="h-6" />
          <Input label="Email" />
          <Input label="Password" />
          <div className="flex justify-between items-center mb-4">
            <span className={wf.label}>☐ Ingat saya</span>
            <span className={wf.label}>Lupa password?</span>
          </div>
          <Btn w={260}>Masuk</Btn>
          <div className="h-3" />
          <GhostBtn w={260}>Daftar Akun Baru</GhostBtn>
          <div className="h-4" />
          <div className={`${wf.boxD} p-3`}>
            <div className={wf.label}>Demo: owner@gurita.com · kasir@gurita.com</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function RegisterWF() {
  return (
    <Frame title="02 · Register" subtitle="/register">
      <div className="max-w-md mx-auto">
        <Line w="50%" h={16} />
        <div className="h-4" />
        <Input label="Nama Lengkap" />
        <Input label="Email" />
        <Input label="Password" />
        <Input label="Konfirmasi Password" />
        <Btn w={300}>Daftar</Btn>
      </div>
    </Frame>
  );
}

function ForgotWF() {
  return (
    <Frame title="03 · Forgot / Reset Password" subtitle="/forgot-password · /reset-password">
      <div className="grid grid-cols-2 gap-8">
        <div>
          <Line w="60%" h={16} />
          <Line w="80%" h={8} />
          <div className="h-4" />
          <Input label="Email" />
          <Btn w={220}>Kirim Link Reset</Btn>
        </div>
        <div>
          <Line w="60%" h={16} />
          <Line w="80%" h={8} />
          <div className="h-4" />
          <Input label="Password Baru" />
          <Input label="Konfirmasi Password" />
          <Btn w={220}>Simpan Password</Btn>
        </div>
      </div>
    </Frame>
  );
}

/* --- Admin shell (sidebar + content) --- */

function AdminShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const items = [
    "Dashboard",
    "Laporan Penjualan",
    "Manajemen Akun",
    "Pengaturan",
  ];
  return (
    <div className="grid grid-cols-[240px_1fr] gap-6 min-h-[560px]">
      <aside className={`${wf.box} p-4`}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-full border border-black" />
          <div>
            <Line w="80px" h={8} />
            <Line w="50px" h={6} />
          </div>
        </div>
        {items.map((it) => (
          <div
            key={it}
            className={`px-3 py-2 mb-2 border border-black text-[12px] ${
              it === active ? "bg-black text-white" : "bg-white"
            }`}
          >
            {it}
          </div>
        ))}
        <div className="mt-8">
          <GhostBtn w={200}>Logout</GhostBtn>
        </div>
      </aside>
      <main>{children}</main>
    </div>
  );
}

function AdminDashboardWF() {
  return (
    <Frame title="04 · Admin — Dashboard" subtitle="/admin">
      <AdminShell active="Dashboard">
        <Line w="40%" h={18} />
        <Line w="25%" h={8} />
        <div className="grid grid-cols-4 gap-3 my-4">
          <Block h={90} label="Penjualan Hari Ini" />
          <Block h={90} label="Transaksi" />
          <Block h={90} label="Produk Terjual" />
          <Block h={90} label="Kasir Online" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Block h={220} label="Grafik Penjualan" className="col-span-2" />
          <Block h={220} label="Kasir Online (list)" />
        </div>
      </AdminShell>
    </Frame>
  );
}

function AdminReportsWF() {
  return (
    <Frame title="05 · Admin — Laporan Penjualan" subtitle="/admin/reports">
      <AdminShell active="Laporan Penjualan">
        <div className="flex justify-between items-end mb-4">
          <div>
            <Line w="200px" h={18} />
            <Line w="120px" h={8} />
          </div>
          <Btn w={150}>Print to PDF</Btn>
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Block h={60} label="Filter Tanggal" />
          <Block h={60} label="Filter Kasir" />
          <Block h={60} label="Filter Event" />
          <Block h={60} label="Cari" />
        </div>
        <div className={`${wf.box}`}>
          <div className="grid grid-cols-6 gap-2 p-3 border-b border-black bg-black/10 text-[10px] uppercase">
            <span>Invoice</span><span>Tanggal</span><span>Kasir</span>
            <span>Item</span><span>Total</span><span>Status</span>
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 p-3 border-b border-black/40">
              {Array.from({ length: 6 }).map((__, j) => <Line key={j} w="80%" h={6} />)}
            </div>
          ))}
        </div>
      </AdminShell>
    </Frame>
  );
}

function AdminAccountsWF() {
  return (
    <Frame title="06 · Admin — Manajemen Akun" subtitle="/admin/accounts">
      <AdminShell active="Manajemen Akun">
        <div className="flex justify-between items-end mb-4">
          <Line w="220px" h={18} />
          <Btn w={220}>＋ Daftarkan Kasir Baru</Btn>
        </div>
        <div className="flex gap-2 mb-4">
          <GhostBtn w={90}>Owner</GhostBtn>
          <GhostBtn w={90}>Kasir</GhostBtn>
          <GhostBtn w={110}>Volunteer</GhostBtn>
        </div>
        <div className={wf.box}>
          <div className="grid grid-cols-5 gap-2 p-3 border-b border-black bg-black/10 text-[10px] uppercase">
            <span>Nama</span><span>Email</span><span>Role</span><span>Status</span><span>Aksi</span>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 p-3 border-b border-black/40 items-center">
              <Line w="80%" h={6} /><Line w="90%" h={6} /><Line w="50%" h={6} />
              <Line w="40%" h={6} />
              <div className="flex gap-1">
                <div className="border border-black w-6 h-6" />
                <div className="border border-black w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </AdminShell>
    </Frame>
  );
}

function AdminSettingsWF() {
  return (
    <Frame title="07 · Admin — Pengaturan" subtitle="/admin/settings">
      <AdminShell active="Pengaturan">
        <div className="flex justify-between items-end mb-4">
          <Line w="280px" h={18} />
          <Btn w={170}>Edit Pengaturan</Btn>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`${wf.box} p-4`}>
            <Line w="40%" h={12} />
            <div className="h-3" />
            <Input label="Pilih Event (preset)" />
            <Input label="Nama Event" />
            <Input label="Alamat Owner" />
            <Input label="No. Telepon" />
          </div>
          <div className={`${wf.box} p-4`}>
            <Line w="40%" h={12} />
            <div className="flex items-center gap-4 my-4">
              <div className="w-20 h-20 rounded-full border border-black" />
              <GhostBtn w={140}>Ganti Logo</GhostBtn>
            </div>
            <Block h={70} label="Metode Pembayaran" />
            <div className="h-3" />
            <Block h={70} label="Reset Data Transaksi" dashed />
          </div>
        </div>
      </AdminShell>
    </Frame>
  );
}

/* --- POS shell --- */

function PosShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const items = [
    "Beranda / Transaksi",
    "Produk",
    "Kategori",
    "Riwayat Transaksi",
    "Pengaturan",
  ];
  return (
    <div className="grid grid-cols-[220px_1fr] gap-4 min-h-[560px]">
      <aside className={`${wf.box} p-3`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-full border border-black" />
          <Line w="80px" h={8} />
        </div>
        {items.map((it) => (
          <div
            key={it}
            className={`px-3 py-2 mb-1 border border-black text-[11px] ${
              it === active ? "bg-black text-white" : "bg-white"
            }`}
          >
            {it}
          </div>
        ))}
      </aside>
      <main>{children}</main>
    </div>
  );
}

function PosHomeWF() {
  return (
    <Frame title="08 · POS — Beranda / Transaksi" subtitle="/pos">
      <PosShell active="Beranda / Transaksi">
        <div className="grid grid-cols-[1fr_320px] gap-4">
          <div>
            <div className="flex gap-2 mb-3">
              <Block h={36} label="Cari produk" className="flex-1" />
              <GhostBtn w={100}>Semua</GhostBtn>
              <GhostBtn w={100}>Bouquet</GhostBtn>
              <GhostBtn w={100}>Snack</GhostBtn>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${wf.box} p-2`}>
                  <Block h={90} />
                  <div className="h-2" />
                  <Line w="80%" h={8} />
                  <Line w="50%" h={6} />
                </div>
              ))}
            </div>
          </div>
          <div className={`${wf.box} ${wf.fillD} p-3 flex flex-col`}>
            <Line w="50%" h={12} />
            <Line w="30%" h={6} />
            <div className="h-3" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b border-black/40 py-2">
                <Line w="70%" h={6} />
                <div className="flex justify-between">
                  <Line w="40%" h={6} />
                  <Line w="20%" h={6} />
                </div>
              </div>
            ))}
            <div className="mt-auto pt-3">
              <div className="flex justify-between mb-1"><Line w="30%" h={6} /><Line w="30%" h={6} /></div>
              <div className="flex justify-between mb-3"><Line w="20%" h={10} /><Line w="40%" h={10} /></div>
              <Btn w={280}>Checkout</Btn>
            </div>
          </div>
        </div>
      </PosShell>
    </Frame>
  );
}

function PosProductsWF() {
  return (
    <Frame title="09 · POS — Produk" subtitle="/pos/products">
      <PosShell active="Produk">
        <div className="flex justify-between items-end mb-4">
          <Line w="180px" h={16} />
          <Btn w={170}>＋ Tambah Produk</Btn>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`${wf.box} p-2`}>
              <Block h={100} />
              <Line w="80%" h={8} />
              <Line w="50%" h={6} />
              <div className="flex gap-1 mt-1">
                <div className="border border-black flex-1 h-6" />
                <div className="border border-black flex-1 h-6" />
              </div>
            </div>
          ))}
        </div>
      </PosShell>
    </Frame>
  );
}

function PosCategoriesWF() {
  return (
    <Frame title="10 · POS — Kategori" subtitle="/pos/categories">
      <PosShell active="Kategori">
        <div className="flex justify-between items-end mb-4">
          <Line w="180px" h={16} />
          <Btn w={180}>＋ Tambah Kategori</Btn>
        </div>
        <div className={wf.box}>
          <div className="grid grid-cols-4 gap-2 p-3 border-b border-black bg-black/10 text-[10px] uppercase">
            <span>Nama</span><span>Jumlah Produk</span><span>Dibuat</span><span>Aksi</span>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-2 p-3 border-b border-black/40 items-center">
              <Line w="60%" h={6} /><Line w="20%" h={6} /><Line w="50%" h={6} />
              <div className="flex gap-1">
                <div className="border border-black w-6 h-6" />
                <div className="border border-black w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      </PosShell>
    </Frame>
  );
}

function PosHistoryWF() {
  return (
    <Frame title="11 · POS — Riwayat Transaksi" subtitle="/pos/history">
      <PosShell active="Riwayat Transaksi">
        <Line w="220px" h={16} />
        <div className="grid grid-cols-3 gap-3 my-4">
          <Block h={50} label="Filter Tanggal" />
          <Block h={50} label="Filter Status" />
          <Block h={50} label="Cari Invoice" />
        </div>
        <div className={wf.box}>
          <div className="grid grid-cols-5 gap-2 p-3 border-b border-black bg-black/10 text-[10px] uppercase">
            <span>Invoice</span><span>Tanggal</span><span>Item</span><span>Total</span><span>Status</span>
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 p-3 border-b border-black/40">
              {Array.from({ length: 5 }).map((__, j) => <Line key={j} w="80%" h={6} />)}
            </div>
          ))}
        </div>
      </PosShell>
    </Frame>
  );
}

function PosSettingsWF() {
  return (
    <Frame title="12 · POS — Pengaturan Kasir" subtitle="/pos/settings">
      <PosShell active="Pengaturan">
        <div className="grid grid-cols-2 gap-4">
          <div className={`${wf.box} p-4`}>
            <Line w="40%" h={12} />
            <div className="flex items-center gap-4 my-4">
              <div className="w-16 h-16 rounded-full border border-black" />
              <GhostBtn w={140}>Ubah Foto</GhostBtn>
            </div>
            <Input label="Nama" />
            <Input label="Email" />
            <Input label="Password Baru" />
          </div>
          <div className={`${wf.box} p-4`}>
            <Line w="50%" h={12} />
            <div className="h-2" />
            <Block h={60} label="Preferensi Struk" />
            <div className="h-2" />
            <Block h={60} label="Printer / Cetak" />
            <div className="h-2" />
            <Block h={60} label="Logout dari Perangkat" />
          </div>
        </div>
      </PosShell>
    </Frame>
  );
}

function CheckoutModalWF() {
  return (
    <Frame title="13 · POS — Modal Checkout" subtitle="overlay pada /pos">
      <div className="relative min-h-[460px]">
        <div className="absolute inset-0 bg-black/30" />
        <div className={`${wf.box} bg-white relative mx-auto mt-10 w-[520px] p-6`}>
          <Line w="40%" h={16} />
          <div className="h-3" />
          <div className="flex justify-between mb-1"><Line w="30%" h={6} /><Line w="20%" h={6} /></div>
          <div className="flex justify-between mb-1"><Line w="30%" h={6} /><Line w="20%" h={6} /></div>
          <div className="flex justify-between mb-3"><Line w="20%" h={10} /><Line w="30%" h={10} /></div>
          <Input label="Metode Pembayaran" />
          <Input label="Uang Dibayar" />
          <div className="flex justify-between mb-4">
            <span className={wf.label}>Kembalian</span>
            <Line w="30%" h={8} />
          </div>
          <div className="flex gap-2 justify-end">
            <GhostBtn w={100}>Batal</GhostBtn>
            <Btn w={160}>Bayar & Cetak</Btn>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ============================================================
   Page
   ============================================================ */

function WireframePage() {
  return (
    <div className={wf.page}>
      <header className="border-b-2 border-black py-8 text-center">
        <div className="text-[11px] uppercase tracking-[0.3em]">
          Gurita Bouquet · POS System
        </div>
        <h1 className="text-4xl font-bold mt-2">Wireframe Dokumentasi</h1>
        <div className="text-[12px] mt-2 text-black/60">
          Black & white · Low-fidelity · Semua halaman frontend
        </div>
      </header>

      <main className="pb-20">
        <LoginWF />
        <RegisterWF />
        <ForgotWF />
        <AdminDashboardWF />
        <AdminReportsWF />
        <AdminAccountsWF />
        <AdminSettingsWF />
        <PosHomeWF />
        <PosProductsWF />
        <PosCategoriesWF />
        <PosHistoryWF />
        <PosSettingsWF />
        <CheckoutModalWF />
      </main>

      <footer className="border-t-2 border-black py-6 text-center text-[11px] uppercase tracking-[0.3em]">
        End of wireframe · Gurita Bouquet © 2026
      </footer>
    </div>
  );
}
