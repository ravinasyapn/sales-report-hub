import { ReactNode } from "react";

/**
 * AuthLayout — tampilan login & lupa password versi Gurita POS.
 * Split layout pink dengan judul serif besar di kiri & kartu form di kanan.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-pink-soft">
      <div className="min-h-screen w-full grid lg:grid-cols-2 gap-0 items-center px-6 py-10 lg:px-16">
        {/* Kiri — Brand */}
        <div className="flex flex-col justify-center items-start text-left">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-maroon leading-[0.95] tracking-tight">
            GURITA
            <br />
            BOUQUET.
          </h1>
          <p className="font-display italic text-2xl lg:text-3xl text-pink-deep mt-4">
            by Gurita House
          </p>
        </div>

        {/* Kanan — Form card */}
        <div className="flex justify-center lg:justify-end">
          <div
            className="w-full max-w-md bg-card text-card-foreground rounded-3xl p-8 sm:p-10"
            style={{ boxShadow: "0 20px 60px -20px rgba(120, 20, 40, 0.25)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
