import { BrandLogo } from "@/components/ui/BrandLogo";

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 px-5 pt-6" aria-busy="true" aria-label="Cargando">
      <BrandLogo className="mb-5" />
      <div className="animate-pulse space-y-4">
      <div className="h-7 w-40 rounded-xl bg-slate-200" />
      <div className="h-4 w-56 rounded-lg bg-slate-200/70" />
      <div className="h-48 rounded-3xl bg-slate-200" />
      <div className="h-32 rounded-3xl bg-slate-200/70" />
      <div className="h-64 rounded-3xl bg-slate-200/70" />
      </div>
    </div>
  );
}
