import confetti from "canvas-confetti";

const COLORS = ["#059669", "#34d399", "#fbbf24", "#f59e0b", "#38bdf8"];

export function celebrate(big = false) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  confetti({
    particleCount: big ? 160 : 70,
    spread: big ? 100 : 70,
    startVelocity: big ? 45 : 32,
    origin: { y: 0.75 },
    colors: COLORS,
    zIndex: 9999,
    disableForReducedMotion: true,
  });

  if (big) {
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: COLORS, zIndex: 9999 });
      confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: COLORS, zIndex: 9999 });
    }, 250);
  }
}
