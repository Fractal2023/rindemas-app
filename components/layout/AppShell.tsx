"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ProSheet } from "@/components/plan/ProSheet";
import { ThemeController } from "@/components/plan/ThemeController";
import { ConnectionStatus } from "@/components/pwa/ConnectionStatus";
import { QuickAddSheet, type QuickAddType } from "@/components/quick-add/QuickAddSheet";
import { LockScreen } from "@/components/security/LockScreen";
import { isSessionUnlocked } from "@/lib/security";
import { useFinance } from "@/lib/store";
import type { ThemeId } from "@/lib/types";
import { BottomNav } from "./BottomNav";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface AppActions {
  /** Opens the quick-add sheet; `productId` pre-fills a despensa purchase of that product. */
  openQuickAdd: (type?: QuickAddType, productId?: string) => void;
  /** Opens the RindeMás PRO sheet; `theme` is the locked theme that triggered it, if any. */
  openProSheet: (theme?: ThemeId) => void;
}

const AppActionsContext = createContext<AppActions>({ openQuickAdd: () => {}, openProSheet: () => {} });

export const useAppActions = () => useContext(AppActionsContext);
export const useQuickAdd = useAppActions;

/** Open state for a sheet whose form resets on every open without remounting the sheet (keeps exit animation). */
function useSheet<T>(initial: T) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<T>(initial);
  const [session, setSession] = useState(0);
  const show = useCallback((value: T) => {
    setPayload(value);
    setSession((n) => n + 1);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);
  return { open, payload, session, show, close };
}

export function AppShell({ children }: { children: ReactNode }) {
  const state = useFinance();
  // Read lazily on the client; while `state` is null (SSR/hydration) the lock isn't rendered anyway.
  const [unlocked, setUnlocked] = useState(isSessionUnlocked);
  // setPin() also marks the session unlocked, so creating a PIN doesn't lock you out immediately.
  const locked = !!state?.settings.security && !unlocked && !isSessionUnlocked();
  const quickAdd = useSheet<{ type: QuickAddType; productId?: string }>({ type: "despensa" });
  const pro = useSheet<ThemeId | undefined>(undefined);
  const showQuickAdd = quickAdd.show;
  const showPro = pro.show;

  const actions = useMemo<AppActions>(
    () => ({
      openQuickAdd: (type = "despensa", productId) => showQuickAdd({ type, productId }),
      openProSheet: (theme) => showPro(theme),
    }),
    [showQuickAdd, showPro],
  );

  if (state && locked) {
    return (
      <div className="mx-auto w-full max-w-md bg-[var(--app-bg)]">
        <ThemeController settings={state.settings} />
        <LockScreen onUnlock={() => setUnlocked(true)} />
      </div>
    );
  }

  return (
    <AppActionsContext.Provider value={actions}>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[var(--app-bg)] sm:shadow-[0_0_60px_-20px_rgba(0,0,0,0.15)]">
        <ConnectionStatus />
        <main className="flex-1 pb-32">{state ? children : <LoadingSkeleton />}</main>
        <BottomNav onAdd={() => showQuickAdd({ type: "despensa" })} />
      </div>
      {state && (
        <>
          <ThemeController settings={state.settings} />
          <QuickAddSheet
            session={quickAdd.session}
            open={quickAdd.open}
            initialType={quickAdd.payload.type}
            initialProductId={quickAdd.payload.productId}
            onClose={quickAdd.close}
          />
          <ProSheet session={pro.session} open={pro.open} pendingTheme={pro.payload} onClose={pro.close} />
        </>
      )}
    </AppActionsContext.Provider>
  );
}
