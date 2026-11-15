"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { House, LayoutDashboard, LayoutGrid, Megaphone, Moon, Plus, Sun, Users, X } from "lucide-react";
import { useTheme } from "next-themes";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

export const sections = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Campaigns", icon: Megaphone },
  { name: "Customers", icon: Users }
] as const;
export type Section = (typeof sections)[number]["name"];

const spring = { type: "spring", stiffness: 420, damping: 38 } as const;

/** Floating button in the bottom-right corner that opens the navigation panel. */
export function AppMenu({
  open,
  onOpenChange,
  current,
  onNavigate,
  onNewCampaign
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: Section;
  onNavigate: (section: Section) => void;
  onNewCampaign: () => void;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("[aria-current='page'], button, a")?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
      // Keep keyboard focus inside the open panel.
      if (event.key === "Tab" && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>("button, a")];
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      (previous ?? trigger.current)?.focus();
    };
  }, [open, onOpenChange]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-40 bg-indigo/40 dark:bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange(false)}
              aria-hidden
            />
            <motion.div
              key="panel"
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed bottom-3 right-3 top-3 z-50 bg-surface flex w-[min(20rem,calc(100vw-1.5rem))] flex-col rounded-[1.75rem] p-3 shadow-[0_24px_60px_-12px_rgb(10_24_40/0.45)] ring-1 ring-ink/10 pb-safe"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={spring}
            >
              <div className="flex items-center justify-between px-2 py-2">
                <Link href="/" className="flex items-center gap-2.5 rounded-lg text-base font-semibold">
                  <BrandMark />
                  Campaign Copilot
                </Link>
                <button type="button" onClick={() => onOpenChange(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              <nav aria-label="Sections" className="mt-2 flex flex-col gap-1">
                {sections.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    aria-current={current === name ? "page" : undefined}
                    onClick={() => {
                      onNavigate(name);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-xl px-3 text-left text-base transition-colors",
                      current === name ? "bg-accent text-accent-ink" : "hover:bg-ink/5"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                    {name}
                  </button>
                ))}
              </nav>

              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onNewCampaign();
                }}
                className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full bg-ink text-base font-semibold text-bg hover:bg-ink/90"
              >
                <Plus className="h-5 w-5" aria-hidden />
                New campaign
              </button>

              <div className="mt-auto flex flex-col gap-1 border-t pt-3">
                <Link href="/" className="flex h-12 items-center gap-3 rounded-xl px-3 text-base hover:bg-ink/5">
                  <House className="h-5 w-5" aria-hidden />
                  Home page
                </Link>
                <button
                  type="button"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="flex h-12 items-center gap-3 rounded-xl px-3 text-left text-base hover:bg-ink/5"
                >
                  <Sun className="hidden h-5 w-5 dark:block" aria-hidden />
                  <Moon className="h-5 w-5 dark:hidden" aria-hidden />
                  <span className="dark:hidden">Dark appearance</span>
                  <span className="hidden dark:inline">Light appearance</span>
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <motion.button
        ref={trigger}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => onOpenChange(true)}
        whileTap={{ scale: 0.92 }}
        className="glass fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-30 grid h-14 w-14 place-items-center rounded-full text-ink shadow-[0_10px_30px_-8px_rgb(10_24_40/0.45)] ring-1 ring-ink/10"
      >
        <LayoutGrid className="h-[1.375rem] w-[1.375rem]" aria-hidden />
      </motion.button>
    </MotionConfig>
  );
}
