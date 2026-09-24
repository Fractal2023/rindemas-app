import { cn } from "@/lib/utils";

export const BRAND = {
  name: "RindeMás",
  domain: "RindeMás.app",
  slogan: "Haz que la despensa y la quincena te rindan más",
};

/** Basket mark + "Rinde" / "Más" wordmark. */
export function BrandLogo({ showSlogan = true, className }: { showSlogan?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <svg viewBox="0 0 64 64" className="size-10 shrink-0 drop-shadow-sm" aria-hidden>
        <rect width="64" height="64" rx="16" style={{ fill: "var(--color-emerald-600)" }} />
        <path d="M20 26h24l-3 18a4 4 0 0 1-4 3H27a4 4 0 0 1-4-3z" style={{ fill: "var(--color-white)" }} />
        <path d="M26 26l6-9 6 9" fill="none" style={{ stroke: "var(--color-white)" }} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="36" r="3.5" style={{ fill: "var(--color-emerald-600)" }} />
      </svg>
      <div className="min-w-0">
        <p className="text-xl leading-none font-extrabold tracking-tight text-slate-900">
          Rinde<span className="text-emerald-600">Más</span>
        </p>
        {showSlogan && <p className="mt-1 text-[11px] leading-tight text-slate-500">{BRAND.slogan}</p>}
      </div>
    </div>
  );
}
