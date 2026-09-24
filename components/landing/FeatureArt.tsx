import { Delete } from "lucide-react";

/**
 * Static, simplified fragments of the real app screens, used as illustrations
 * next to each feature on the landing page. Values are example data.
 */

const card = "rounded-3xl bg-white p-5 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70";

export function BalanceArt() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-[0_24px_60px_-24px_rgba(5,150,105,0.6)]">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>Disponible esta semana</span>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold">Quedan 4 días</span>
      </div>
      <p className="mt-1 font-mono text-4xl font-semibold tabular-nums">$5,660</p>
      <p className="text-sm text-white/80">Puedes gastar ~$1,415 por día</p>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-black/15">
        <span className="w-[14%] bg-white" />
        <span className="w-[4%] bg-amber-300" />
        <span className="w-[7%] bg-sky-300" />
      </div>
      <div className="mt-3 flex gap-4 text-[11px] text-white/85">
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-white" />Despensa $1,055</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-300" />Gustos $295</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-sky-300" />Abonos $490</span>
      </div>
    </div>
  );
}

const PRICES: { name: string; unit: string; price: string; pct: string; up: boolean | null }[] = [
  { name: "Jitomate saladet", unit: "kg", price: "$34.50", pct: "+23.2%", up: true },
  { name: "Huevo blanco 30 pzas", unit: "paq", price: "$96", pct: "+7.9%", up: true },
  { name: "Aguacate Hass", unit: "kg", price: "$62", pct: "-17.3%", up: false },
  { name: "Garrafón de agua 20 L", unit: "pza", price: "$45", pct: "0%", up: null },
];

export function PricesArt() {
  return (
    <div className={card}>
      <p className="text-sm font-bold text-slate-900">Precios de tu despensa</p>
      <ul className="mt-3 divide-y divide-slate-100">
        {PRICES.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-sm font-medium text-slate-700">{p.name}</span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                {p.price}
                <span className="text-slate-400">/{p.unit}</span>
              </span>
              <span
                className={`w-16 rounded-full py-0.5 text-center font-mono text-[11px] font-semibold ${
                  p.up === true
                    ? "bg-rose-50 text-rose-600"
                    : p.up === false
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {p.pct}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DebtsArt() {
  const debts = [
    { who: "Tanda con Doña Lupe", kind: "Debo", pending: "$2,500", of: "$5,000", pct: 50, tone: "bg-sky-500" },
    { who: "Primo Juan", kind: "Me debe", pending: "$1,500", of: "$1,500", pct: 0, tone: "bg-emerald-500" },
    { who: "Comadre Rosa · tamales", kind: "Me debe", pending: "$350", of: "$800", pct: 56, tone: "bg-emerald-500" },
  ];
  return (
    <div className="space-y-3">
      {debts.map((d) => (
        <div key={d.who} className={`${card} py-4`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">{d.who}</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">{d.kind}</span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <p className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
              {d.pending} <span className="text-xs font-normal text-slate-400">de {d.of}</span>
            </p>
            <span className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">Abonar</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${d.tone}`} style={{ width: `${d.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SplitArt() {
  return (
    <div className={`${card} flex items-center gap-5`}>
      <div
        className="relative size-28 shrink-0 rounded-full"
        style={{ background: "conic-gradient(#059669 0 34%, #fbbf24 34% 47%, #38bdf8 47% 100%)" }}
        aria-hidden
      >
        <div className="absolute inset-[18%] grid place-items-center rounded-full bg-white text-center">
          <span className="font-mono text-sm font-semibold text-slate-900">$2,343</span>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        <li className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-emerald-600" />Necesidad <b className="font-mono">34%</b></li>
        <li className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-amber-400" />Gusto <b className="font-mono">13%</b></li>
        <li className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-sky-400" />Deudas <b className="font-mono">53%</b></li>
      </ul>
    </div>
  );
}

export function KeypadArt() {
  return (
    <div className={card}>
      <div className="flex gap-1.5 text-[11px] font-bold">
        <span className="flex-1 rounded-xl bg-emerald-600 py-2 text-center text-white">Despensa</span>
        <span className="flex-1 rounded-xl bg-slate-100 py-2 text-center text-slate-500">Gusto</span>
        <span className="flex-1 rounded-xl bg-slate-100 py-2 text-center text-slate-500">Abono</span>
      </div>
      <p className="py-3 text-center font-mono text-4xl font-semibold text-slate-900">
        <span className="text-2xl text-slate-400">$</span>86
      </p>
      <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Jitomate · 2 kg → <b className="text-slate-800">$43/kg</b> <b className="text-rose-600">+24.6%</b>
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {["1", "2", "3", "4", "5", "6"].map((k) => (
          <span key={k} className="rounded-xl bg-slate-100 py-2 text-center text-sm font-semibold text-slate-700">
            {k}
          </span>
        ))}
        <span className="rounded-xl bg-slate-100 py-2 text-center text-sm font-semibold text-slate-700">.</span>
        <span className="rounded-xl bg-slate-100 py-2 text-center text-sm font-semibold text-slate-700">0</span>
        <span className="grid place-items-center rounded-xl bg-slate-100 text-slate-700">
          <Delete className="size-4" />
        </span>
      </div>
    </div>
  );
}
