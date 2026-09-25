import { Download, Lock, ServerOff, UserX } from "lucide-react";

const POINTS = [
  { icon: UserX, title: "Sin cuenta ni correo", text: "Abres la app y empiezas. No te pedimos nombre, teléfono ni correo." },
  { icon: ServerOff, title: "No salen de tu celular", text: "Tus gastos y deudas se guardan en tu dispositivo. Nadie de RindeMás puede verlos." },
  { icon: Lock, title: "Bloqueo con PIN", text: "Pon un PIN de 4 dígitos para que nadie más abra tus cuentas en tu celular." },
  { icon: Download, title: "Respaldo y borrado", text: "Descarga tus datos cuando quieras o bórralos todos con un botón." },
];

export function Privacy() {
  return (
    <section id="privacidad" className="scroll-mt-20 bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-emerald-700">Privacidad</p>
          <h2 className="font-display mt-2 text-4xl leading-tight font-extrabold tracking-[-0.02em] text-slate-900 sm:text-5xl">
            Tus cuentas son tuyas. Se quedan en tu celular.
          </h2>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map((p) => (
            <li key={p.title} className="rounded-3xl bg-white p-6 ring-1 ring-slate-200/70">
              <p.icon className="size-6 text-emerald-600" />
              <p className="mt-4 font-bold text-slate-900">{p.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{p.text}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-2xl text-sm text-slate-500">
          Como todo vive en tu dispositivo, si borras los datos del navegador o cambias de celular, tus registros no se mueven solos.
          Descarga un respaldo de vez en cuando desde Ajustes. Si usas el dictado por voz y tu navegador no puede reconocer voz
          dentro del celular, el audio lo transcribe el servicio de voz del navegador por internet; la app te lo avisa antes.
        </p>
      </div>
    </section>
  );
}
