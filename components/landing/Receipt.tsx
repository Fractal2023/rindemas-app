import type { CSSProperties } from "react";

/**
 * Hero signature: a supermarket ticket that "prints" on load, showing what
 * RindeMás does with a week of groceries. Example data, labeled as such.
 */

type Trend = "up" | "down" | "flat";

const ITEMS: { name: string; qty: string; price: string; trend: Trend; pct: string }[] = [
  { name: "JITOMATE SALADET", qty: "2 kg", price: "69.00", trend: "up", pct: "+23%" },
  { name: "HUEVO BLANCO 30 PZ", qty: "1 paq", price: "96.00", trend: "up", pct: "+8%" },
  { name: "AGUACATE HASS", qty: "1 kg", price: "62.00", trend: "down", pct: "-17%" },
  { name: "TORTILLAS DE MAÍZ", qty: "2 kg", price: "52.00", trend: "up", pct: "+8%" },
  { name: "GARRAFÓN 20 L", qty: "2 pz", price: "90.00", trend: "flat", pct: "=" },
  { name: "ACEITE VEGETAL 1 L", qty: "1 pz", price: "44.90", trend: "down", pct: "-6%" },
];

const TREND_CLASS: Record<Trend, string> = {
  up: "text-rose-600",
  down: "text-emerald-600",
  flat: "text-slate-400",
};

/** Staggered print-in delay for each ticket line. */
const line = (i: number): CSSProperties => ({ animationDelay: `${0.55 + i * 0.09}s` });

export function Receipt() {
  let i = 0;
  return (
    <div className="relative mx-auto w-full max-w-[22rem]">
      {/* Printer slot */}
      <div className="relative z-10 mx-auto h-4 w-[92%] rounded-full bg-slate-900 shadow-[inset_0_-3px_0_rgba(255,255,255,0.08)]" />

      <div className="-mt-2 overflow-hidden px-[4%] pb-6">
        <div className="receipt-paper receipt-print font-mono text-[12.5px] leading-[1.55] text-slate-800">
          <div className="px-5 pt-6 pb-2 text-center">
            <p className="receipt-line font-semibold tracking-[0.2em]" style={line(i++)}>
              RINDEMÁS
            </p>
            <p className="receipt-line text-[11px] text-slate-500" style={line(i++)}>
              TICKET DE LA SEMANA · FAMILIA GARCÍA
            </p>
            <p className="receipt-line text-[11px] text-slate-400" style={line(i++)}>
              ************ EJEMPLO ************
            </p>
          </div>

          <ul className="px-5">
            {ITEMS.map((it) => (
              <li key={it.name} className="receipt-line py-0.5" style={line(i++)}>
                <div className="flex justify-between gap-3">
                  <span className="truncate">{it.name}</span>
                  <span className="tabular-nums">${it.price}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{it.qty}</span>
                  <span className={`font-semibold ${TREND_CLASS[it.trend]}`}>
                    {it.trend === "up" ? "▲" : it.trend === "down" ? "▼" : "·"} {it.pct} vs. semana pasada
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="px-5 pt-2">
            <p className="receipt-line overflow-hidden text-slate-300 whitespace-nowrap" style={line(i++)}>
              - - - - - - - - - - - - - - - - - - - - - - - -
            </p>
            <div className="receipt-line flex justify-between" style={line(i++)}>
              <span>GASTADO ESTA SEMANA</span>
              <span className="tabular-nums">$1,840.00</span>
            </div>
            <div className="receipt-line flex justify-between text-rose-600" style={line(i++)}>
              <span>TU CANASTA SUBIÓ</span>
              <span className="font-semibold tabular-nums">+1.4%</span>
            </div>
            <div
              className="receipt-line mt-2 flex items-baseline justify-between rounded-md bg-emerald-50 px-2 py-1.5 text-emerald-700"
              style={line(i++)}
            >
              <span className="font-semibold">DISPONIBLE</span>
              <span className="text-lg font-semibold tabular-nums">$5,660.00</span>
            </div>
            <p className="receipt-line mt-1 text-right text-[11px] text-slate-500" style={line(i++)}>
              ≈ $1,415 por día · quedan 4 días
            </p>
          </div>

          <div className="receipt-line px-5 pt-4 pb-8 text-center" style={line(i++)}>
            <div className="receipt-barcode mx-auto h-9 w-48" aria-hidden />
            <p className="mt-1 text-[10px] tracking-[0.35em] text-slate-400">RINDEMAS.APP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
