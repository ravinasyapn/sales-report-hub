import logo from "@/assets/gurita-logo.png";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Gurita Bouquet by Gurita House"
      width={1024}
      height={1024}
      className={className}
    />
  );
}
