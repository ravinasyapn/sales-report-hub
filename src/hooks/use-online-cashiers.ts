/**
 * Hook: useOnlineCashiers
 * ----------------------------------------------------------------------------
 * Mengembalikan daftar kasir yang sedang online (dipakai di dashboard admin).
 * Saat ini memakai data dummy di localStorage; ganti ke API realtime saat
 * backend siap (mis. Supabase Realtime channel "presence").
 */
import { useEffect, useState } from "react";

export type OnlineCashier = {
  id: string;
  name: string;
  device?: string;
  since: string; // ISO time
};

const KEY = "gb_online_cashiers";
const EVT = "gb-online-cashiers-changed";

const SEED: OnlineCashier[] = [
  { id: "c1", name: "Salsabila Putri", device: "Tablet A", since: new Date(Date.now() - 42 * 60_000).toISOString() },
  { id: "c2", name: "Rizky Pratama",   device: "Tablet B", since: new Date(Date.now() - 18 * 60_000).toISOString() },
];

function read(): OnlineCashier[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw);
  } catch {
    return SEED;
  }
}

export function useOnlineCashiers(): OnlineCashier[] {
  const [list, setList] = useState<OnlineCashier[]>([]);
  useEffect(() => {
    setList(read());
    const on = () => setList(read());
    window.addEventListener(EVT, on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return list;
}