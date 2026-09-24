"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface DonutSegment {
  key: string;
  value: number;
  color: string;
}

export function DonutChart({ segments, children }: { segments: DonutSegment[]; children?: ReactNode }) {
  const size = 200;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  const gap = total > 0 && segments.filter((s) => s.value > 0).length > 1 ? 4 : 0;

  let offset = 0;
  return (
    <div className="relative mx-auto size-52">
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" style={{ stroke: "var(--color-slate-100)" }} strokeWidth={stroke} />
        {total > 0 &&
          segments.map((s, i) => {
            const len = (s.value / total) * c;
            const dash = Math.max(len - gap, 0);
            const el = (
              <motion.circle
                key={s.key}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                style={{ stroke: s.color }}
                strokeWidth={stroke}
                strokeLinecap="butt"
                initial={{ strokeDasharray: `0 ${c}` }}
                animate={{ strokeDasharray: `${dash} ${c - dash}` }}
                transition={{ duration: 0.8, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
