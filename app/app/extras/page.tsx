import type { Metadata } from "next";
import { ExtrasView } from "@/components/extras/ExtrasView";

export const metadata: Metadata = { title: "Extras" };

export default function ExtrasPage() {
  return <ExtrasView />;
}
