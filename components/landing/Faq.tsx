import { Plus } from "lucide-react";
import { PRO_PRICE_MXN, TRIAL_DAYS } from "@/lib/plan";

const FAQ = [
  {
    q: "¿Tengo que crear una cuenta?",
    a: "No. Abres RindeMás en el navegador de tu celular y empiezas a anotar. Puedes agregarla a tu pantalla de inicio para abrirla como cualquier app.",
  },
  {
    q: "¿Dónde se guardan mis datos?",
    a: "En tu propio celular, dentro del navegador. No se envían a ningún servidor y nadie de RindeMás puede verlos. Por lo mismo, si borras los datos del navegador o cambias de teléfono, descarga antes un respaldo desde Ajustes.",
  },
  {
    q: "¿Qué pasa si olvido mi PIN?",
    a: "El PIN evita que otras personas abran tus cuentas en tu celular. No se puede recuperar: para volver a entrar hay que borrar los datos de ese dispositivo. Por eso conviene descargar respaldos.",
  },
  {
    q: "¿Puedo anotar mis compras con la voz?",
    a: "Sí. Toca el micrófono y di, por ejemplo, “dos jabones de 30 pesos”: RindeMás llena el producto, la cantidad y el precio para que solo confirmes. Si tu navegador puede reconocer voz dentro del celular (Chrome reciente, después de descargar el español una vez), funciona sin internet y el audio no sale de tu teléfono. Si no, usa el dictado en línea del navegador, que necesita internet; la app te lo avisa antes.",
  },
  {
    q: "¿Cómo sabe RindeMás si un producto subió?",
    a: "Compara el precio que anotas con el que registraste la vez anterior para ese mismo producto. Entre más compras anotes, más completo es tu historial de precios.",
  },
  {
    q: "¿Cómo funciona la prueba de PRO?",
    a: `Desde Ajustes activas ${TRIAL_DAYS} días de PRO gratis. Al terminar, la app regresa al plan Gratuito y conservas todos tus datos. PRO cuesta $${PRO_PRICE_MXN} MXN al mes.`,
  },
];

export function Faq() {
  return (
    <section id="preguntas" className="scroll-mt-20 bg-slate-50 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr]">
        <h2 className="font-display text-4xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900 sm:text-5xl">
          Preguntas frecuentes
        </h2>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <Plus className="size-5 shrink-0 text-emerald-600 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
