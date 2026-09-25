import { FREE_PLAN } from "./plan";
import { withReplenishment } from "./replenishment";
import { DEFAULT_THEME } from "./themes";
import type { Debt, FinanceState, Product, ProductCategory, Transaction, TxKind, Unit } from "./types";
import { round2, startOfWeek } from "./utils";

/** What a first-time user starts with: no records at all. */
export function createEmptyState(): FinanceState {
  return {
    version: 1,
    settings: { familyName: "Mi familia", weeklyIncome: 0, theme: DEFAULT_THEME, plan: FREE_PLAN },
    products: [],
    transactions: [],
    debts: [],
    shoppingList: [],
  };
}

/**
 * Optional example data for a Mexican family (Ajustes → "Cargar datos de ejemplo").
 * All dates are relative to `now` so "this week" and "last week" are populated.
 */
export function createDemoState(now = new Date()): FinanceState {
  const weekStart = startOfWeek(now);
  const todayIndex = (now.getDay() + 6) % 7;

  /** Date for `weekOffset` (0 = this week) on weekday `day` (0 = Mon), never in the future. */
  const at = (weekOffset: number, day: number, hour = 12, minute = 0) => {
    const d = new Date(weekStart);
    const safeDay = weekOffset === 0 ? Math.min(day, todayIndex) : day;
    d.setDate(d.getDate() + weekOffset * 7 + safeDay);
    d.setHours(hour, minute, 0, 0);
    if (d.getTime() > now.getTime()) return new Date(now.getTime() - 60_000).toISOString();
    return d.toISOString();
  };

  // name, unit, category, [2 weeks ago, last week, this week]
  const catalog: [string, Unit, ProductCategory, (number | null)[]][] = [
    ["Jitomate saladet", "kg", "Frutas y verduras", [26.9, 28, 34.5]],
    ["Aguacate Hass", "kg", "Frutas y verduras", [79, 75, 62]],
    ["Limón sin semilla", "kg", "Frutas y verduras", [42, 45, 38]],
    ["Cebolla blanca", "kg", "Frutas y verduras", [null, 30, 30]],
    ["Huevo blanco (30 pzas)", "paquete", "Lácteos y huevo", [86, 89, 96]],
    ["Leche entera 1 L", "litro", "Lácteos y huevo", [28, 28.5, 29.5]],
    ["Tortillas de maíz", "kg", "Tortillería y pan", [23, 24, 26]],
    ["Pan de caja grande", "paquete", "Tortillería y pan", [null, 52, 55]],
    ["Aceite vegetal 1 L", "litro", "Abarrotes", [49, 48, 44.9]],
    ["Frijol negro", "kg", "Abarrotes", [37, 38, 39.5]],
    ["Arroz súper extra", "kg", "Abarrotes", [null, 32, 31]],
    ["Pechuga de pollo", "kg", "Carnes", [119, 125, 132]],
    ["Garrafón de agua 20 L", "pieza", "Bebidas", [45, 45, 45]],
    ["Refresco de cola 2.5 L", "pieza", "Bebidas", [41, 42, 44]],
    ["Detergente en polvo 1 kg", "paquete", "Limpieza", [null, 65, 65]],
  ];

  const products: Product[] = catalog.map(([name, unit, category, prices], i) => {
    const offsets = [-2, -1, 0];
    const history = prices.flatMap((price, j) =>
      price == null ? [] : [{ price, date: at(offsets[j], j === 2 ? 1 + (i % 3) : 2 + (i % 4), 10 + (i % 6)) }],
    );
    return { id: `prod_${i + 1}`, name, unit, category, history };
  });

  const pid = (name: string) => products.find((p) => p.name.startsWith(name))!.id;
  const priceOf = (name: string, week: -1 | 0) => {
    const p = products.find((x) => x.name.startsWith(name))!;
    return week === 0 ? p.history[p.history.length - 1].price : p.history[p.history.length - 2].price;
  };

  let n = 0;
  const tx = (
    kind: TxKind,
    amount: number,
    description: string,
    category: string,
    date: string,
    extra: Partial<Transaction> = {},
  ): Transaction => ({ id: `tx_seed_${++n}`, kind, amount: round2(amount), description, category, date, ...extra });

  const groceries = (week: -1 | 0, name: string, qty: number, day: number, hour: number) => {
    const p = products.find((x) => x.name.startsWith(name))!;
    return tx(
      "despensa",
      priceOf(name, week) * qty,
      `${p.name}${qty !== 1 ? ` · ${qty} ${p.unit}` : ""}`,
      p.category,
      at(week, day, hour),
      { productId: pid(name) },
    );
  };

  const debts: Debt[] = [
    {
      id: "debt_tanda",
      direction: "debo",
      kind: "tanda",
      counterparty: "Doña Lupe (tanda)",
      concept: "Tanda de $500 semanales · 10 números",
      total: 5000,
      pending: 3000,
      createdAt: at(-5, 0, 9),
      payments: [
        { id: "pay_t1", amount: 500, date: at(-4, 0, 9) },
        { id: "pay_t2", amount: 500, date: at(-3, 0, 9) },
        { id: "pay_t3", amount: 500, date: at(-2, 0, 9) },
        { id: "pay_t4", amount: 500, date: at(-1, 0, 9, 30) },
      ],
    },
    {
      id: "debt_coppel",
      direction: "debo",
      kind: "tarjeta",
      counterparty: "Tarjeta Coppel",
      concept: "Refrigerador a 18 meses",
      total: 8400,
      pending: 6150,
      createdAt: at(-12, 3, 17),
      payments: [
        { id: "pay_c1", amount: 750, date: at(-8, 4, 18) },
        { id: "pay_c2", amount: 750, date: at(-4, 4, 18) },
        { id: "pay_c3", amount: 750, date: at(0, 1, 19) },
      ],
    },
    {
      id: "debt_tio",
      direction: "debo",
      kind: "prestamo",
      counterparty: "Tío Ramiro",
      concept: "Préstamo para la reparación del boiler",
      total: 3000,
      pending: 1200,
      createdAt: at(-9, 5, 13),
      payments: [
        { id: "pay_r1", amount: 1000, date: at(-6, 5, 13) },
        { id: "pay_r2", amount: 800, date: at(-2, 5, 13) },
      ],
    },
    {
      id: "debt_juan",
      direction: "me-deben",
      kind: "prestamo",
      counterparty: "Primo Juan",
      concept: "Le presté para la inscripción de la escuela",
      total: 1500,
      pending: 1500,
      createdAt: at(-2, 2, 20),
      payments: [],
    },
    {
      id: "debt_rosa",
      direction: "me-deben",
      kind: "fiado",
      counterparty: "Comadre Rosa",
      concept: "Pedido de tamales para la posada",
      total: 800,
      pending: 350,
      createdAt: at(-3, 6, 11),
      payments: [
        { id: "pay_ro1", amount: 250, date: at(-2, 6, 11) },
        { id: "pay_ro2", amount: 200, date: at(-1, 3, 16) },
      ],
    },
    {
      id: "debt_tono",
      direction: "me-deben",
      kind: "otro",
      counterparty: "Vecino Toño",
      concept: "Gasolina para la mudanza",
      total: 600,
      pending: 600,
      createdAt: at(-1, 5, 10),
      payments: [],
    },
  ];

  const debtPaymentTx = (debtId: string, paymentId: string) => {
    const d = debts.find((x) => x.id === debtId)!;
    const p = d.payments.find((x) => x.id === paymentId)!;
    return tx(
      d.direction === "debo" ? "abono" : "cobro",
      p.amount,
      d.direction === "debo" ? `Abono a ${d.counterparty}` : `Cobro a ${d.counterparty}`,
      d.direction === "debo" ? "Deudas" : "Cobros",
      p.date,
      { debtId, paymentId },
    );
  };

  const transactions: Transaction[] = [
    // --- 3 and 2 weeks ago (for report trends) ---
    tx("despensa", 1380, "Despensa semanal en el tianguis", "Abarrotes", at(-3, 5, 11)),
    tx("despensa", 420, "Carnicería", "Carnes", at(-3, 2, 13)),
    tx("gusto", 310, "Pizza del viernes", "Comida fuera", at(-3, 4, 20)),
    tx("gusto", 139, "Plataforma de streaming", "Suscripciones", at(-3, 1, 8)),
    tx("despensa", 1520, "Despensa semanal en Bodega", "Abarrotes", at(-2, 5, 10)),
    tx("despensa", 180, "Garrafones y tortillas", "Bebidas", at(-2, 2, 9)),
    tx("gusto", 460, "Cine con los niños", "Salidas", at(-2, 6, 17)),
    tx("gusto", 95, "Elotes y esquites", "Antojos", at(-2, 3, 19)),
    debtPaymentTx("debt_tanda", "pay_t3"),
    debtPaymentTx("debt_tio", "pay_r2"),

    // --- Last week ---
    groceries(-1, "Jitomate", 2, 1, 10),
    groceries(-1, "Huevo", 1, 1, 10),
    groceries(-1, "Tortillas", 1, 0, 13),
    groceries(-1, "Tortillas", 1, 3, 13),
    groceries(-1, "Garrafón", 2, 2, 9),
    groceries(-1, "Leche", 4, 1, 10),
    groceries(-1, "Aceite", 1, 1, 10),
    groceries(-1, "Pechuga", 1.5, 4, 12),
    groceries(-1, "Aguacate", 1, 5, 11),
    groceries(-1, "Frijol", 2, 5, 11),
    groceries(-1, "Refresco", 2, 5, 11),
    groceries(-1, "Detergente", 1, 5, 11),
    tx("gusto", 185, "Tacos al pastor", "Comida fuera", at(-1, 4, 21)),
    tx("gusto", 139, "Plataforma de streaming", "Suscripciones", at(-1, 1, 8)),
    tx("gusto", 78, "Paletas y churros", "Antojos", at(-1, 6, 18)),
    debtPaymentTx("debt_tanda", "pay_t4"),
    debtPaymentTx("debt_rosa", "pay_ro2"),

    // --- This week ---
    groceries(0, "Tortillas", 1, 0, 13, ),
    groceries(0, "Jitomate", 2, 1, 10),
    groceries(0, "Huevo", 1, 1, 10),
    groceries(0, "Leche", 4, 1, 10),
    groceries(0, "Garrafón", 2, 1, 9),
    groceries(0, "Limón", 1, 1, 10),
    groceries(0, "Pechuga", 1, 2, 12),
    groceries(0, "Tortillas", 1, 2, 13),
    groceries(0, "Aguacate", 1, 3, 11),
    groceries(0, "Pan de caja", 1, 3, 11),
    tx("gusto", 55, "Café de olla y concha", "Antojos", at(0, 0, 8, 30)),
    tx("gusto", 240, "Quesadillas con la familia", "Comida fuera", at(0, 2, 20)),
    debtPaymentTx("debt_coppel", "pay_c3"),
  ];

  // --- Household items bought on a steady rhythm (drives "Por terminarse esta semana") ---
  const daysAgo = (n: number, hour = 11) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  // name, unit, category, [days ago, price] per purchase (oldest first)
  const household: [string, Unit, ProductCategory, [number, number][]][] = [
    ["Papel de baño 12 rollos", "paquete", "Higiene personal", [[29, 89], [15, 95]]], // every 14 days → ran out yesterday
    ["Pasta de dientes 100 ml", "pieza", "Higiene personal", [[40, 38], [20, 41]]], // every 20 days → today
    ["Jabón de tocador 3 pzas", "paquete", "Higiene personal", [[19, 42], [9, 45]]], // every 10 days → tomorrow
    ["Cloro 1 L", "litro", "Limpieza", [[18, 24], [6, 26]]], // every 12 days → fine
  ];
  household.forEach(([name, unit, category, buys], i) => {
    const id = `prod_h${i + 1}`;
    products.push({ id, name, unit, category, history: buys.map(([d, price]) => ({ price, date: daysAgo(d, 10) })) });
    buys.forEach(([d, price]) => transactions.push(tx("despensa", price, name, category, daysAgo(d, 10), { productId: id })));
  });

  transactions.sort((a, b) => b.date.localeCompare(a.date));

  return {
    version: 1,
    settings: { familyName: "Familia García", weeklyIncome: 7500, theme: DEFAULT_THEME, plan: FREE_PLAN },
    products: withReplenishment(products, transactions),
    transactions,
    debts,
    shoppingList: [],
  };
}
