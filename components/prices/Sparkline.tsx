import type { PricePoint } from "@/lib/types";

export function Sparkline({ history, color }: { history: PricePoint[]; color: string }) {
  if (history.length < 2) return null;
  const w = 280;
  const h = 64;
  const pad = 6;
  const prices = history.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;
  const pts = prices.map((p, i) => [
    pad + (i / (prices.length - 1)) * (w - pad * 2),
    h - pad - ((p - min) / span) * (h - pad * 2),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
  const gid = `spark-${color.replace(/[^a-z0-9]/gi, "")}`; // one gradient per trend color

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" style={{ stopColor: color }} stopOpacity="0.25" />
          <stop offset="100%" style={{ stopColor: color }} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" style={{ stroke: color }} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 2.5} style={{ fill: "var(--color-white)", stroke: color }} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}
