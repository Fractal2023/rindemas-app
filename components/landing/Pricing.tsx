import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { ProPlanCard } from "./ProPlanCard";

const FREE = [
  "Balance semanal y disponible por día",
  "Tracker de precios con subidas y bajadas",
  "Deudas, préstamos, tandas y fiados",
  "Ingresos extra y gastos imprevistos",
  "1 préstamo a plazos activo",
  "Reportes de necesidad vs. gusto",
  "Bloqueo con PIN, respaldo y borrado",
  "Funciona sin internet",
];


type Cell = boolean | "soon" | string;

const COMPARISON: { group: string; rows: { feature: string; hint?: string; free: Cell; pro: Cell; highlight?: boolean }[] }[] = [
  {
    group: "Lo esencial",
    rows: [
      { feature: "Balance semanal y disponible por día", free: true, pro: true },
      { feature: "Tracker de inflación del súper", free: true, pro: true },
      { feature: "Deudas, préstamos, tandas y fiados", free: true, pro: true },
      { feature: "Ingresos extra y gastos imprevistos", hint: "Gestión básica, sin límite de registros", free: true, pro: true },
      { feature: "Reportes de necesidad vs. gusto", free: true, pro: true },
      { feature: "Registro rápido con teclado", free: true, pro: true },
      { feature: "Bloqueo con PIN, respaldo y borrado", free: true, pro: true },
      { feature: "Funciona sin internet", free: true, pro: true },
    ],
  },
  {
    group: "Exclusivo de PRO",
    rows: [
      {
        feature: "🎙️ Registro de compras por voz, manos libres",
        hint: "Sin internet y sin que el audio salga del celular en navegadores compatibles",
        free: false,
        pro: true,
        highlight: true,
      },
      {
        feature: "🔔 Gestor de suscripciones y alertas anti-cobros",
        hint: "Control de pruebas gratis con semáforo y link directo para cancelar",
        free: false,
        pro: true,
        highlight: true,
      },
      {
        feature: "🧠 Motor predictivo de reabastecimiento",
        hint: "Semáforo de consumo y lista de compra sugerida",
        free: false,
        pro: true,
        highlight: true,
      },
      {
        feature: "Préstamos y créditos a plazos",
        hint: "Cuota automática, pagado vs. restante",
        free: "1 activo",
        pro: "Ilimitados",
        highlight: true,
      },
      {
        feature: "Recordatorios de fechas de pago",
        hint: "Aviso en la app cuando un pago vence en 3 días o menos",
        free: false,
        pro: true,
        highlight: true,
      },
      { feature: "Temas visuales", free: "1", pro: "5" },
      { feature: "Alertas de precio, metas de ahorro y reportes descargables", free: false, pro: "soon" },
    ],
  },
];

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto size-5 text-emerald-600" aria-label="Incluido" />;
  if (value === false) return <Minus className="mx-auto size-4 text-slate-300" aria-label="No incluido" />;
  if (value === "soon")
    return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 uppercase">Pronto</span>;
  return <span className="text-xs leading-tight font-bold text-slate-700">{value}</span>;
}

export function Pricing() {
  return (
    <section id="planes" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-emerald-700">Planes</p>
          <h2 className="font-display mt-2 text-4xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900 sm:text-5xl">
            Lo esencial es gratis.
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            PRO te ahorra tiempo y sustos: anota hablando, sabe qué se te va a acabar y te avisa antes de que te cobren una prueba.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="flex flex-col rounded-3xl p-7 ring-1 ring-slate-200">
            <p className="font-bold text-slate-900">Gratuito</p>
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-5xl font-extrabold text-slate-900">$0</span>
              <span className="text-sm text-slate-500">MXN</span>
            </p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-700">
              {FREE.map((f) => (
                <li key={f} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/app"
              className="mt-8 rounded-full bg-slate-900 py-3.5 text-center font-bold text-white transition hover:bg-slate-800"
            >
              Empezar gratis
            </Link>
          </div>

          <ProPlanCard />
        </div>

        {/* Free vs PRO comparison */}
        <div className="mt-16">
          <h3 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-slate-900 sm:text-3xl">Gratuito vs. PRO</h3>
          <div className="mt-6 overflow-hidden rounded-3xl ring-1 ring-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold sm:px-6">
                    Función
                  </th>
                  <th scope="col" className="w-20 px-2 py-3 text-center font-semibold sm:w-28">
                    Gratuito
                  </th>
                  <th scope="col" className="w-20 px-2 py-3 text-center font-bold text-emerald-700 sm:w-28">
                    PRO
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((section) => (
                  <Fragment key={section.group}>
                    <tr className="border-t border-slate-200 bg-white">
                      <th colSpan={3} scope="colgroup" className="px-4 pt-5 pb-2 text-xs font-bold tracking-wide text-slate-400 uppercase sm:px-6">
                        {section.group}
                      </th>
                    </tr>
                    {section.rows.map((row) => (
                      <tr key={row.feature} className={row.highlight ? "bg-emerald-50/60" : "bg-white"}>
                        <th scope="row" className="border-t border-slate-100 px-4 py-3 font-medium text-slate-800 sm:px-6">
                          <span className={row.highlight ? "font-bold text-slate-900" : undefined}>{row.feature}</span>
                          {row.hint && <span className="mt-0.5 block text-xs font-normal text-slate-500">{row.hint}</span>}
                        </th>
                        <td className="border-t border-slate-100 px-2 py-3 text-center">
                          <CellValue value={row.free} />
                        </td>
                        <td className="border-t border-slate-100 px-2 py-3 text-center">
                          <CellValue value={row.pro} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            En los dos planes tus datos financieros se quedan en tu celular: no hay cuentas, servidores ni bases de datos con tu
            información.
          </p>
        </div>
      </div>
    </section>
  );
}
