import { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center lg:justify-start">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-accent text-center lg:text-left leading-tight">
            Gurita Bouquet
            <span className="block text-2xl lg:text-3xl font-semibold text-primary mt-2">
              by Gurita House
            </span>
          </h1>
        </div>
        <div
          className="bg-card text-card-foreground rounded-3xl p-10 lg:p-12"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
