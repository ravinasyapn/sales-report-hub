/**
 * Hook: useAdminRole
 * ----------------------------------------------------------------------------
 * Menyimpan role yang sedang dipilih di halaman Admin: "user" atau "kasir".
 * Disimpan di `sessionStorage` agar reset saat tab ditutup.
 * Mendengarkan event kustom `gb-role-changed` supaya semua komponen sinkron.
 */
import { useEffect, useState } from "react";

export type Role = "user" | "kasir";
export type RoleState = Role | "";
export const ROLE_KEY = "gb_admin_role";

export function useAdminRole(): [RoleState, (r: Role) => void] {
  const [role, setRoleState] = useState<RoleState>("");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = (sessionStorage.getItem(ROLE_KEY) as RoleState) || "";
    setRoleState(r);
    const onChange = () => {
      const r2 = (sessionStorage.getItem(ROLE_KEY) as RoleState) || "";
      setRoleState(r2);
    };
    window.addEventListener("gb-role-changed", onChange);
    return () => window.removeEventListener("gb-role-changed", onChange);
  }, []);
  const setRole = (r: Role) => {
    sessionStorage.setItem(ROLE_KEY, r);
    setRoleState(r);
    window.dispatchEvent(new Event("gb-role-changed"));
  };
  return [role, setRole];
}
