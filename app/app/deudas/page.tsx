import type { Metadata } from "next";
import { DebtsView } from "@/components/debts/DebtsView";

export const metadata: Metadata = { title: "Deudas" };

export default function DeudasPage() {
  return <DebtsView />;
}
