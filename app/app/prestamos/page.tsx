import type { Metadata } from "next";
import { LoansView } from "@/components/loans/LoansView";

export const metadata: Metadata = { title: "Préstamos" };

export default function PrestamosPage() {
  return <LoansView />;
}
