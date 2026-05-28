import { useEffect, useState } from "react";

export type Role = "user" | "kasir";
export const ROLE_KEY = "gb_admin_role";

export function useAdminRole(): [Role, (r: Role) => void] {
  const [role, setRoleState] = useState<Role>("user");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const r = (sessionStorage.getItem(ROLE_KEY) as Role) || "user";
    setRoleState(r);
    const onChange = () => {
      const r2 = (sessionStorage.getItem(ROLE_KEY) as Role) || "user";
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
