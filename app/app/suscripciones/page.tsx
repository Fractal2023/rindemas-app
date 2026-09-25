import type { Metadata } from "next";
import { SubscriptionsView } from "@/components/subscriptions/SubscriptionsView";

export const metadata: Metadata = { title: "Suscripciones" };

export default function SuscripcionesPage() {
  return <SubscriptionsView />;
}
