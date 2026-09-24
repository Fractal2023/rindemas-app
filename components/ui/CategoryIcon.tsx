import { createElement } from "react";
import { categoryIcon } from "@/lib/icons";
import type { TxKind } from "@/lib/types";

export function CategoryIcon({ category, kind, className }: { category: string; kind?: TxKind; className?: string }) {
  return createElement(categoryIcon(category, kind), { className });
}
