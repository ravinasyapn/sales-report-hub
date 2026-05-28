import { useState } from "react";
import { PillInput } from "./PillInput";

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <PillInput type={show ? "text" : "password"} className="pr-28" {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        {show ? "Sembunyikan" : "Tampilkan"}
      </button>
    </div>
  );
}
