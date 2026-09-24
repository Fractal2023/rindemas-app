import type { ThemeDefinition } from "@/lib/themes";
import { cn } from "@/lib/utils";

/** Mini phone-screen preview of a theme, drawn with the theme's own fixed colors. */
export function ThemeSwatch({ theme, className }: { theme: ThemeDefinition; className?: string }) {
  const { bg, card, accent, accentEnd, text } = theme.preview;
  return (
    <div className={cn("overflow-hidden rounded-2xl p-2", className)} style={{ background: bg }} aria-hidden>
      <div className="h-7 rounded-lg" style={{ background: `linear-gradient(135deg, ${accent}, ${accentEnd})` }} />
      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg px-1.5 py-1.5" style={{ background: card }}>
        <span className="size-3 rounded-full" style={{ background: accent }} />
        <span className="h-1.5 flex-1 rounded-full opacity-60" style={{ background: text }} />
      </div>
      <div className="mt-1.5 flex gap-1.5">
        <span className="h-3 flex-1 rounded-md" style={{ background: card }} />
        <span className="h-3 w-5 rounded-md" style={{ background: accent }} />
      </div>
    </div>
  );
}
