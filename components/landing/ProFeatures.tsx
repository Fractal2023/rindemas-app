import { Crown } from "lucide-react";
import type { ReactNode } from "react";

/** Landing: the three RindeMás PRO features, each with a small illustration of the real UI (example data). */

function Card({ emoji, title, text, children }: { emoji: string; title: string; text: string; children: ReactNode }) {
  return (
    <li className="flex flex-col rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10">
      <p className="text-3xl" aria-hidden>
        {emoji}
      </p>
      <h3 className="font-display mt-3 text-xl leading-snug font-extrabold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-300">{text}</p>
      <div className="mt-6">{children}</div>
    </li>
  );
}

export function ProFeatures() {
  return (
    <section id="pro" className="scroll-mt-20 bg-slate-900 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-300">
            <Crown className="size-4" /> Exclusivo de RindeMás PRO
          </p>
          <h2 className="font-display mt-4 text-4xl leading-tight font-extrabold tracking-[-0.02em] text-white sm:text-5xl">
            Menos tiempo anotando, cero cobros sorpresa.
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Tres herramientas que trabajan dentro de tu celular, igual que el resto de RindeMás.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          <Card
            emoji="🎙️"
            title="Registro de compras por voz, manos libres"
            text="Con el carrito en una mano, di “dos jabones de 30 pesos” y RindeMás llena producto, cantidad y precio. Sin internet y sin que el audio salga del celular en los navegadores que reconocen voz en el dispositivo; en los demás te avisamos antes de usar el dictado en línea."
          >
            <div className="space-y-2 text-sm">
              <p className="w-fit rounded-2xl rounded-bl-md bg-white/10 px-3.5 py-2 text-slate-200">“dos jabones de 30 pesos”</p>
              <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-emerald-500/20 px-3.5 py-2 font-semibold text-emerald-200">
                2 × $30 = $60 ✓
              </p>
            </div>
          </Card>

          <Card
            emoji="🔔"
            title="Gestor de suscripciones y alertas anti-cobros"
            text="Anota Netflix, Spotify o esa prueba gratis de 7 días. Ves cuánto pagas al mes y al año, y un semáforo te avisa cuando faltan 3 días para cancelar, con el link directo para hacerlo."
          >
            <div className="space-y-2 text-xs font-semibold">
              <p className="flex justify-between rounded-xl bg-rose-500/20 px-3 py-2 text-rose-200">
                <span>Disney+ · prueba</span>
                <span>Faltan 2 días</span>
              </p>
              <p className="flex justify-between rounded-xl bg-amber-400/20 px-3 py-2 text-amber-200">
                <span>Canva Pro · prueba</span>
                <span>Faltan 3 días</span>
              </p>
            </div>
          </Card>

          <Card
            emoji="🧠"
            title="Motor predictivo de reabastecimiento"
            text="RindeMás aprende cada cuánto compras cada producto y te avisa lo que se va a acabar esta semana. Un toque y queda en tu compra de hoy."
          >
            <div className="space-y-2 text-xs font-semibold">
              <p className="flex justify-between rounded-xl bg-rose-500/20 px-3 py-2 text-rose-200">
                <span>Papel de baño</span>
                <span>Se acabó ayer</span>
              </p>
              <p className="flex justify-between rounded-xl bg-amber-400/20 px-3 py-2 text-amber-200">
                <span>Jabón de tocador</span>
                <span>Se acaba mañana</span>
              </p>
              <p className="flex justify-between rounded-xl bg-emerald-500/15 px-3 py-2 text-emerald-200">
                <span>Cloro</span>
                <span>Cada 12 días</span>
              </p>
            </div>
          </Card>
        </ul>
      </div>
    </section>
  );
}
