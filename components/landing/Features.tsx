import type { ReactNode } from "react";
import { BalanceArt, DebtsArt, ExtrasArt, KeypadArt, LoansArt, PricesArt, SplitArt } from "./FeatureArt";

function Feature({
  kicker,
  title,
  children,
  art,
  flip,
}: {
  kicker: string;
  title: string;
  children: ReactNode;
  art: ReactNode;
  flip?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
      <div className={flip ? "md:order-2" : undefined}>
        <p className="text-sm font-semibold text-emerald-700">{kicker}</p>
        <h3 className="font-display mt-2 text-3xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900 sm:text-4xl">{title}</h3>
        <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">{children}</div>
      </div>
      <div className={flip ? "md:order-1" : undefined}>{art}</div>
    </div>
  );
}

export function Features() {
  return (
    <section id="funciones" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl space-y-24 px-4 sm:px-6 md:space-y-32">
        <Feature kicker="Balance semanal" title="Sabes cuánto te queda antes de llegar a la caja." art={<BalanceArt />}>
          <p>
            Pon lo que entra a la semana y RindeMás resta cada compra, antojo y abono. La barra cambia a rojo cuando te acercas al
            límite, y te dice cuánto puedes gastar por día hasta la siguiente semana.
          </p>
        </Feature>

        <Feature kicker="Tracker de inflación" title="El jitomate subió 23%. Te enteras antes de pagar." art={<PricesArt />} flip>
          <p>
            Cada vez que anotas un producto con su precio, RindeMás lo compara con la última vez que lo compraste. Rojo si subió,
            verde si bajó, gris si sigue igual.
          </p>
          <p>Busca por nombre o filtra por categoría: frutas y verduras, lácteos, tortillería, abarrotes, carnes y más.</p>
        </Feature>

        <Feature kicker="Deudas, préstamos y tandas" title="Lo que debes y lo que te deben, sin libreta." art={<DebtsArt />}>
          <p>
            Registra la tanda de las vecinas, la tarjeta departamental, lo que le prestaste a tu primo o el fiado de la tienda. Cada
            abono baja el saldo y se refleja en tu disponible de la semana.
          </p>
        </Feature>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Reportes</p>
            <h3 className="font-display mt-2 text-3xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900">
              ¿Necesidad o gusto?
            </h3>
            <p className="mt-3 mb-6 text-base leading-relaxed text-slate-600">
              Ve en qué se fue el dinero de la semana, compáralo con la anterior y revisa tus últimas 4 semanas.
            </p>
            <SplitArt />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">Registro rápido</p>
            <h3 className="font-display mt-2 text-3xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900">
              Anota una compra en 5 segundos.
            </h3>
            <p className="mt-3 mb-6 text-base leading-relaxed text-slate-600">
              Toca +, escribe el monto y listo. Si pones el producto y la cantidad, el precio por kilo se guarda solo.
            </p>
            <KeypadArt />
          </div>
        </div>

        <Feature
          kicker="💰 Ingresos extra e imprevistos"
          title="Control de Ingresos Extras y Gastos Imprevistos."
          art={<ExtrasArt />}
          flip
        >
          <p>
            Anota entradas adicionales, como bonos, ventas o trabajos por tu cuenta, y los gastos de emergencia en salud o
            reparaciones, sin alterar tu presupuesto fijo.
          </p>
          <p>
            Se suman o restan a tu disponible de la semana, y aparte ves tus “Gastos Ocasionales del Mes”, para que no se mezclen con
            la despensa.
          </p>
        </Feature>

        <Feature kicker="💳 Préstamos a plazos" title="Gestor de Préstamos y Créditos a Plazos." art={<LoansArt />}>
          <p>
            Registra el total a pagar con intereses, el plazo en meses o quincenas y el día de pago. RindeMás calcula la cuota y lleva
            la cuenta de lo pagado y lo que falta.
          </p>
          <p>
            Cada pago de cuota se descuenta de tu disponible. El plan Gratuito incluye 1 préstamo activo; con PRO son ilimitados y te
            recordamos en la app cuando se acerca la fecha de pago.
          </p>
        </Feature>
      </div>
    </section>
  );
}
