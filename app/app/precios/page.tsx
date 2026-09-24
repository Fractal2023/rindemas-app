import type { Metadata } from "next";
import { PriceTracker } from "@/components/prices/PriceTracker";

export const metadata: Metadata = { title: "Precios" };

export default function PreciosPage() {
  return <PriceTracker />;
}
