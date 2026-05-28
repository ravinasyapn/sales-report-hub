import { useEffect, useState } from "react";

export type AppSettings = {
  event_name: string;
  owner_address: string;
  owner_phone: string;
};

export const SETTINGS_KEY = "gb_app_settings";
export const SETTINGS_EVENT = "gb-settings-changed";

const DEFAULT_SETTINGS: AppSettings = {
  event_name: "",
  owner_address: "",
  owner_phone: "",
};

function read(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveAppSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(SETTINGS_EVENT));
}

export function useAppSettings(): AppSettings {
  const [s, setS] = useState<AppSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setS(read());
    const onChange = () => setS(read());
    window.addEventListener(SETTINGS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  return s;
}