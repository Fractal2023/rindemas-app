"use client";

import { motion } from "framer-motion";
import { ChartPie, CreditCard, House, Plus, Tags, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/app", label: "Inicio", icon: House },
  { href: "/app/precios", label: "Precios", icon: Tags },
  { href: "/app/deudas", label: "Deudas", icon: CreditCard },
  { href: "/app/reportes", label: "Reportes", icon: ChartPie },
];

function NavItem({ href, label, icon: Icon, active }: (typeof TABS)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold"
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute top-1 h-8 w-14 rounded-full bg-emerald-50"
          transition={{ type: "spring", stiffness: 460, damping: 34 }}
        />
      )}
      <Icon
        className={cn("relative mt-1 size-5 transition-colors", active ? "text-emerald-600" : "text-slate-400")}
        strokeWidth={active ? 2.4 : 2}
      />
      <span className={cn("relative mt-1 transition-colors", active ? "text-slate-900" : "text-slate-400")}>{label}</span>
    </Link>
  );
}

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="relative flex items-end rounded-3xl border border-slate-200/70 bg-white/90 px-1 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        {TABS.slice(0, 2).map((t) => (
          <NavItem key={t.href} {...t} active={isActive(t.href)} />
        ))}

        <div className="flex flex-1 justify-center">
          <motion.button
            onClick={onAdd}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="-mt-7 mb-2 grid size-15 place-items-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-4 ring-[var(--app-bg)]"
            aria-label="Registrar gasto rápido"
          >
            <Plus className="size-7" strokeWidth={2.6} />
          </motion.button>
        </div>

        {TABS.slice(2).map((t) => (
          <NavItem key={t.href} {...t} active={isActive(t.href)} />
        ))}
      </div>
    </nav>
  );
}
