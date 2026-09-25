/**
 * Turns a dictated sentence into a purchase:
 *   "Papel de baño 85 pesos"                 → Papel de baño, 1, $85
 *   "dos jabones de 30 pesos"                → Jabón…, 2, $30 c/u → $60
 *   "3 kilos de jitomate a 25 pesos el kilo" → Jitomate…, 3 kg, $25/kg → $75
 *   "medio kilo de limón en 19 pesos"        → Limón…, 0.5 kg, $19
 *
 * Pure and dependency-free (runs offline, easy to test with Node).
 */

export type SpokenUnit = "kg" | "litro" | "pieza" | "paquete";

export interface CatalogEntry {
  id: string;
  name: string;
  unit: SpokenUnit;
  category: string;
}

export interface ParsedPurchase {
  transcript: string;
  /** Catalog name when matched, otherwise the spoken name (capitalized). */
  productName: string | null;
  matchedProductId?: string;
  quantity: number;
  unit?: SpokenUnit;
  /** Total amount in pesos. */
  total?: number;
  /** Set when the price was said per unit ("de 30 pesos cada uno", "a 25 el kilo"). */
  unitPrice?: number;
  /** Category of the matched product, or a guess from keywords for new products. */
  category?: string;
}

const strip = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!,;:"“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* ---------- Spanish number words → digits ---------- */

const UNITS: Record<string, number> = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18,
  diecinueve: 19, veinte: 20, veintiun: 21, veintiuno: 21, veintiuna: 21, veintidos: 22, veintitres: 23,
  veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
};
const TENS: Record<string, number> = {
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
};
const HUNDREDS: Record<string, number> = {
  cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500,
  seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900,
};

const isNumberWord = (w: string) => w in UNITS || w in TENS || w in HUNDREDS || w === "mil";

/** "treinta y cinco pesos" → "35 pesos", "dos jabones" → "2 jabones". */
export function wordsToDigits(text: string): string {
  const words = text.split(" ");
  const out: string[] = [];
  let i = 0;
  while (i < words.length) {
    if (!isNumberWord(words[i])) {
      out.push(words[i++]);
      continue;
    }
    let total = 0;
    let current = 0;
    while (i < words.length) {
      const w = words[i];
      if (w in HUNDREDS) current += HUNDREDS[w];
      else if (w in TENS) current += TENS[w];
      else if (w in UNITS) current += UNITS[w];
      else if (w === "mil") {
        total += (current || 1) * 1000;
        current = 0;
      } else if (w === "y" && i + 1 < words.length && words[i + 1] in UNITS && current % 10 === 0 && current >= 30) {
        // "treinta y cinco": the "y" joins tens and units
      } else break;
      i++;
    }
    out.push(String(total + current));
  }
  return out.join(" ");
}

/* ---------- Units ---------- */

const UNIT_WORDS: [RegExp, SpokenUnit][] = [
  [/^(kilos?|kilogramos?|kgs?)$/, "kg"],
  [/^(litros?|lts?|l)$/, "litro"],
  [/^(piezas?|pzas?)$/, "pieza"],
  [/^(paquetes?|bolsas?|cajas?|botes?|rollos?)$/, "paquete"],
];
const unitOf = (w: string | undefined): SpokenUnit | undefined => (w ? UNIT_WORDS.find(([re]) => re.test(w))?.[1] : undefined);
const UNIT_ALT = "kilos?|kilogramos?|kgs?|litros?|lts?|l|piezas?|pzas?|paquetes?|bolsas?|cajas?|botes?";

/* ---------- Catalog matching ---------- */

const STOP = new Set(["de", "del", "la", "el", "los", "las", "con", "sin", "para", "y", "a", "en", "por", "un", "una"]);

function stem(word: string) {
  if (word.length > 4 && word.endsWith("ces")) return word.slice(0, -3) + "z";
  if (word.length > 4 && /[^aeiou]es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

const keywords = (text: string) =>
  strip(text)
    .split(" ")
    .filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d/.test(w))
    .map(stem);

export function matchCatalog(spoken: string, catalog: CatalogEntry[]): CatalogEntry | undefined {
  const words = keywords(spoken);
  if (!words.length) return undefined;
  let best: { entry: CatalogEntry; score: number } | undefined;
  for (const entry of catalog) {
    const names = keywords(entry.name);
    const hits = words.filter((w) => names.some((n) => n.startsWith(w) || w.startsWith(n))).length;
    const score = hits / words.length;
    if (score >= 0.5 && (!best || score > best.score || (score === best.score && entry.name.length < best.entry.name.length))) {
      best = { entry, score };
    }
  }
  return best?.entry;
}

/* ---------- Category guess for new products ---------- */

const CATEGORY_HINTS: [RegExp, string][] = [
  [/\b(cloro|detergente|fabuloso|pinol|suavitel|suavizante|esponja|escoba|trapeador|jabon (para|de) (trastes|ropa)|bolsas? de basura|lavatrastes)/, "Limpieza"],
  [/\b(jabon|shampoo|champu|pasta de dientes|cepillo|papel (de )?bano|papel higienico|desodorante|toallas? femenin|rastrillo|panal)/, "Higiene personal"],
  [/\b(leche|huevos?|queso|yogur|yoghurt|mantequilla|crema)\b/, "Lácteos y huevo"],
  [/\b(jitomate|tomate|cebolla|papas?|aguacate|limon|platano|manzana|chiles?|zanahoria|lechuga|naranja|pepino|calabaza)/, "Frutas y verduras"],
  [/\b(tortillas?|pan|bolillos?|tostadas?|telera)/, "Tortillería y pan"],
  [/\b(pollo|pechuga|carne|res|cerdo|chorizo|jamon|salchichas?|pescado|milanesa|bistec)/, "Carnes"],
  [/\b(agua|garrafon|refresco|jugo|cafe|cerveza)/, "Bebidas"],
];

const guessCategory = (name: string) => CATEGORY_HINTS.find(([re]) => re.test(strip(name)))?.[1];

/* ---------- Main parser ---------- */

const NUM = String.raw`\d+(?:[.,]\d{1,2})?`;
const toNumber = (s: string) => Number(s.replace(",", "."));
const round2 = (n: number) => Math.round(n * 100) / 100;

export function parsePurchase(transcript: string, catalog: CatalogEntry[] = []): ParsedPurchase {
  let t = wordsToDigits(strip(transcript));

  // Fractions and cents
  t = t
    .replace(/\bmedio (kilo|litro)\b/g, "0.5 $1")
    .replace(new RegExp(String.raw`(\d+(?:\.\d+)?) (kilos?|litros?) y medio\b`, "g"), (_, n, u) => `${Number(n) + 0.5} ${u}`)
    .replace(/\b(\d+) (?:pesos? )?con (\d{1,2})(?: centavos?)?\b/g, (_, a, b) => `${a}.${b.padStart(2, "0")} pesos`)
    .replace(/\b(\d+) punto (\d{1,2})\b/g, "$1.$2")
    // Fillers at the start: "compré…", "anota…", "gasté en…"
    .replace(/^(?:(?:compre|gaste|pague|agrega|agregar|anota|anotar|registra|registrar|fueron|son|en)\s+)+/, "")
    .trim();

  // --- Price ---
  const pricePatterns = [
    new RegExp(String.raw`\$\s*(${NUM})`),
    new RegExp(String.raw`(${NUM})\s*(?:pesos?|varos?|mxn)\b`),
    new RegExp(String.raw`\b(?:a|en|por|de|cuesta|cuestan|costo|costaron|salio|salieron)\s+(${NUM})\s*$`),
  ];
  let priceMatch: RegExpMatchArray | null = null;
  for (const re of pricePatterns) {
    priceMatch = t.match(re);
    if (priceMatch) break;
  }

  let rest = t;
  let price: number | undefined;
  let perUnit = false;
  let unitFromPrice: SpokenUnit | undefined;

  if (priceMatch && priceMatch.index !== undefined) {
    price = toNumber(priceMatch[1]);
    const before = t.slice(0, priceMatch.index).trimEnd();
    let after = t.slice(priceMatch.index + priceMatch[0].length);

    const perUnitAfter = after.match(
      new RegExp(String.raw`^\s*(?:(?:cada|c/u|el|la|por)\s*(uno|una|${UNIT_ALT})?|cada uno|cada una)\b`),
    );
    if (perUnitAfter) {
      perUnit = true;
      unitFromPrice = unitOf(perUnitAfter[1]);
      after = after.slice(perUnitAfter[0].length);
    }
    // The preposition may sit just before the match ("… a 25 pesos") or inside it ("… a 26").
    const prep = priceMatch[0].trim().match(/^(a|de|en|por)\b/)?.[1] ?? before.match(/\b(a|de|en|por)$/)?.[1];
    rest = `${before.replace(/\b(a|de|en|por|cuesta|cuestan|costo|costaron|salio|salieron)$/, "")} ${after}`;
    // "a 25 pesos" and "(dos jabones) de 30 pesos" name the price of each unit; "en/por" the total.
    // Per-unit only changes the total when a quantity other than 1 was said.
    if (/\b(en total|total|todo)\b/.test(t)) perUnit = false;
    else if (!perUnitAfter && (prep === "a" || prep === "de")) perUnit = true;
  } else {
    // No explicit price: take a trailing number if it isn't the leading quantity.
    const trailing = t.match(new RegExp(String.raw`\s(${NUM})$`));
    if (trailing && trailing.index !== undefined && trailing.index > 0) {
      price = toNumber(trailing[1]);
      rest = t.slice(0, trailing.index);
    }
  }

  // --- Quantity + unit ---
  rest = rest.replace(/\b(en total|total)\b/g, " ").replace(/\s+/g, " ").trim();
  let quantity = 1;
  let unit: SpokenUnit | undefined;
  const lead = rest.match(new RegExp(String.raw`^(${NUM})\s*(${UNIT_ALT})?\b\s*(?:de\s+)?`));
  if (lead) {
    quantity = toNumber(lead[1]) || 1;
    unit = unitOf(lead[2]);
    rest = rest.slice(lead[0].length);
  } else {
    const inner = rest.match(new RegExp(String.raw`\b(${NUM})\s*(${UNIT_ALT})\b`));
    if (inner && inner.index !== undefined) {
      quantity = toNumber(inner[1]) || 1;
      unit = unitOf(inner[2]);
      rest = `${rest.slice(0, inner.index)} ${rest.slice(inner.index + inner[0].length)}`;
    }
  }
  unit = unit ?? unitFromPrice;

  // --- Product name ---
  const spoken = rest
    .replace(/\b(pesos?|varos?|mxn)\b/g, " ")
    .replace(/^(?:de|del|el|la|los|las|un|una|unos|unas)\s+/, "")
    .replace(/\s+(?:de|a|en|por|el|la|y|con|cada)$/, "")
    .replace(/\s+/g, " ")
    .trim();

  const match = spoken ? matchCatalog(spoken, catalog) : undefined;
  const productName = match?.name ?? (spoken ? spoken.charAt(0).toUpperCase() + spoken.slice(1) : null);

  const result: ParsedPurchase = {
    transcript,
    productName,
    matchedProductId: match?.id,
    quantity,
    unit: unit ?? match?.unit,
    category: match?.category ?? (productName ? guessCategory(productName) : undefined),
  };
  if (price !== undefined && price > 0) {
    if (perUnit && quantity !== 1) {
      result.unitPrice = price;
      result.total = round2(price * quantity);
    } else {
      result.total = price;
      if (perUnit) result.unitPrice = price;
    }
  }
  return result;
}
