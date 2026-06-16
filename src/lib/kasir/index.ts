/**
 * ============================================================================
 * BARREL EXPORT — Modul Kasir POS
 * ============================================================================
 * Memungkinkan semua route kasir cukup mengimpor dari `@/lib/kasir`,
 * misalnya: `import { actions, useStore, formatIDR } from "@/lib/kasir";`
 *
 * - api.ts          → fungsi HTTP ke backend (login, produk, transaksi, dll.)
 * - penyimpanan.ts  → state global aplikasi kasir (reactive store)
 * - data-contoh.ts  → data dummy fallback (di folder src/lib/mock/)
 * ============================================================================
 */
export * from "./api";
export * from "./penyimpanan";
export * as dataContoh from "@/lib/mock/data-contoh";
