import { parsePurchase, wordsToDigits, type CatalogEntry, type ParsedPurchase } from "./parsePurchase";

/**
 * Decides what a dictated sentence is:
 *   "ingreso extra de 500 por vender tamales" → extra income (Venta, $500)
 *   "me dieron un bono de 1,200"             → extra income (Bono)
 *   "gasto extra 650 de la consulta médica"  → extra expense (Salud)
 *   "emergencia: plomero 380 pesos"          → extra expense (Emergencia)
 *   anything else                            → grocery purchase (parsePurchase)
 */

export type SpokenIncomeSource = "Venta" | "Trabajo independiente" | "Bono" | "Regalo" | "Otro";
export type SpokenExpenseCategory = "Salud" | "Emergencia" | "Reparaciones" | "Gusto ocasional" | "Otro";

export type SpokenIntent =
  | { kind: "despensa"; purchase: ParsedPurchase; transcript: string }
  | { kind: "ingreso"; amount?: number; source: SpokenIncomeSource; description: string; transcript: string }
  | { kind: "extra"; amount?: number; category: SpokenExpenseCategory; description: string; transcript: string };

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!,;:"“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const INCOME_RE = /\b(ingreso( extra)?|entrada de dinero|bono|aguinaldo|vend(i|imos|er|ieron)|venta|me pagaron|me depositaron|cobre|gane|regalo|me regalaron|propina)\b/;
const EXPENSE_RE =
  /\b(gasto extra|gastos extra|emergencia|imprevisto|doctor|medico|consulta|farmacia|medicinas?|dentista|hospital|reparacion|repare|arreglo|mecanico|plomero|electricista|refaccion)\b/;

function incomeSource(t: string): SpokenIncomeSource {
  if (/\b(bono|aguinaldo)\b/.test(t)) return "Bono";
  if (/\b(regalo|me regalaron)\b/.test(t)) return "Regalo";
  if (/\b(vend(i|imos|er|ieron)|venta)\b/.test(t)) return "Venta";
  if (/\b(trabajo|chamba|me pagaron|servicio|proyecto|freelance)\b/.test(t)) return "Trabajo independiente";
  return "Otro";
}

function expenseCategory(t: string): SpokenExpenseCategory {
  if (/\b(doctor|medico|consulta|farmacia|medicinas?|dentista|hospital|salud)\b/.test(t)) return "Salud";
  if (/\b(reparacion|repare|arreglo|mecanico|plomero|electricista|refaccion)\b/.test(t)) return "Reparaciones";
  if (/\b(emergencia|imprevisto)\b/.test(t)) return "Emergencia";
  return "Otro";
}

/** Words that only say *what kind* of movement it is; removed from the description. */
const KIND_WORDS =
  /\b(ingreso( extra)?|entrada de dinero|gastos? extra|emergencia|imprevisto|me pagaron|me depositaron|me dieron|me regalaron|cobre|gane|vend(i|imos|er|ieron))\b/g;

/** Amount: an explicit "$N" / "N pesos" first, otherwise the first number said. */
function spokenAmount(transcript: string): number | undefined {
  const explicit = parsePurchase(transcript, []).total;
  if (explicit) return explicit;
  const t = wordsToDigits(strip(transcript)).replace(/\b(\d+) con (\d{1,2})\b/g, "$1.$2");
  const m = t.match(/\b\d+(?:[.,]\d{1,2})?\b/);
  return m ? Number(m[0].replace(",", ".")) : undefined;
}

/** Readable description: the sentence without kind words, amounts and filler. */
function describe(transcript: string) {
  const t = wordsToDigits(strip(transcript))
    .replace(KIND_WORDS, " ")
    .replace(/\$\s*\d+(?:[.,]\d+)?|\b\d+(?:[.,]\d+)?\b/g, " ")
    .replace(/\b(pesos?|varos?|mxn|de|del|por|en|un|una|el|la|me|dieron|tuve|hubo|fue|fueron|con|y|a|mil)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}

export function parseIntent(transcript: string, catalog: CatalogEntry[] = []): SpokenIntent {
  const t = strip(transcript);
  const amount = spokenAmount(transcript);

  if (INCOME_RE.test(t)) {
    return { kind: "ingreso", amount, source: incomeSource(t), description: describe(transcript), transcript };
  }
  if (EXPENSE_RE.test(t)) {
    return { kind: "extra", amount, category: expenseCategory(t), description: describe(transcript), transcript };
  }
  return { kind: "despensa", purchase: parsePurchase(transcript, catalog), transcript };
}
