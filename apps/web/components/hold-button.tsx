"use client";

/**
 * Adapted from Kokonut UI "Hold Button" v2.0.0 by @dorianbaffier (MIT)
 * https://kokonutui.com · https://github.com/kokonut-labs/kokonutui
 * Changes: Tailwind v3 classes, the app's accent tokens, one "send" variant, Apple-sized hit target.
 *
 * Press and hold to confirm. The fill tracks the hold, drains back when released early,
 * and on completion the label rolls to a drawn check.
 */

import { Loader2, Send } from "lucide-react";
import { AnimatePresence, animate, MotionConfig, motion, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "holding" | "complete";

const HOLD_KEYS = new Set([" ", "Enter"]);
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const LABEL_TRANSITION = { duration: 0.2, ease: EASE_OUT };
const DRAIN_MS = 300;
const LABEL_DELAY_MS = 150;

function DrawnCheck() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 16 16">
      <motion.path
        animate={{ pathLength: 1 }}
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        initial={{ pathLength: 0 }}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        transition={{ duration: 0.3, delay: 0.1, ease: EASE_OUT }}
      />
    </svg>
  );
}

export function HoldButton({
  children,
  holdingLabel = "Keep holding",
  completeLabel = "Sending",
  holdDuration = 1200,
  disabled,
  busy,
  onHoldComplete,
  resetAfter,
  className
}: {
  children: ReactNode;
  holdingLabel?: ReactNode;
  completeLabel?: ReactNode;
  holdDuration?: number;
  disabled?: boolean;
  /** Keeps the completed state (with a spinner) while the action runs. */
  busy?: boolean;
  onHoldComplete?: () => void;
  /** Return to idle this many ms after completing (for demos with no action behind them). */
  resetAfter?: number;
  className?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [showHoldingLabel, setShowHoldingLabel] = useState(false);
  const labelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const progress = useMotionValue(0);
  const animation = useRef<AnimationPlaybackControls | null>(null);
  const onComplete = useRef(onHoldComplete);
  const reduceMotion = useReducedMotion();
  const clipPath = useTransform(progress, (p) => `inset(0 ${(1 - p) * 100}% 0 0)`);

  useEffect(() => {
    onComplete.current = onHoldComplete;
  }, [onHoldComplete]);

  useEffect(
    () => () => {
      animation.current?.stop();
      if (labelTimer.current) clearTimeout(labelTimer.current);
    },
    []
  );

  // Once the action finishes (busy goes false), return to idle.
  useEffect(() => {
    if (!busy && phaseRef.current === "complete") {
      progress.set(0);
      updatePhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy]);

  function updatePhase(next: Phase) {
    phaseRef.current = next;
    setPhase(next);
    if (labelTimer.current) clearTimeout(labelTimer.current);
    labelTimer.current = null;
    if (next === "holding") labelTimer.current = setTimeout(() => setShowHoldingLabel(true), LABEL_DELAY_MS);
    else setShowHoldingLabel(false);
  }

  function startHold() {
    if (phaseRef.current !== "idle" || disabled) return;
    updatePhase("holding");
    animation.current?.stop();
    const remaining = (1 - progress.get()) * holdDuration;
    animation.current = animate(progress, 1, {
      duration: remaining / 1000,
      ease: "linear",
      onComplete: () => {
        if (phaseRef.current === "holding") {
          updatePhase("complete");
          onComplete.current?.();
          if (resetAfter) {
            setTimeout(() => {
              progress.set(0);
              updatePhase("idle");
            }, resetAfter);
          }
        }
      }
    });
  }

  function endHold() {
    if (phaseRef.current !== "holding") return;
    updatePhase("idle");
    animation.current?.stop();
    animation.current = animate(progress, 0, { duration: reduceMotion ? 0 : (progress.get() * DRAIN_MS) / 1000, ease: EASE_OUT });
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    // Release implicit touch capture so sliding off the button cancels the hold.
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    startHold();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!HOLD_KEYS.has(event.key)) return;
    event.preventDefault();
    if (!event.repeat) startHold();
  }

  const labelKey = phase === "holding" && !showHoldingLabel ? "idle" : phase;
  const label = labelKey === "holding" ? holdingLabel : labelKey === "complete" ? completeLabel : children;

  return (
    <MotionConfig reducedMotion="user">
      <button
        type="button"
        disabled={disabled}
        aria-disabled={phase === "complete" || undefined}
        data-complete={phase === "complete" || undefined}
        onPointerDown={handlePointerDown}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onKeyDown={handleKeyDown}
        onKeyUp={(event) => HOLD_KEYS.has(event.key) && endHold()}
        onBlur={endHold}
        onContextMenu={(event) => event.preventDefault()}
        className={cn(
          "group/hold relative inline-flex h-12 min-w-56 touch-none select-none items-center justify-center overflow-hidden rounded-full px-6 text-base font-semibold [-webkit-touch-callout:none]",
          "bg-accent/15 text-accent transition-colors duration-150 hover:bg-accent/20",
          "data-[complete]:bg-accent data-[complete]:text-accent-ink",
          "disabled:cursor-not-allowed disabled:opacity-45",
          className
        )}
      >
        <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-accent/25 group-data-[complete]/hold:opacity-0" style={{ clipPath }} />
        <span className="relative flex items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={labelKey}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
              initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
              transition={LABEL_TRANSITION}
              className="inline-flex items-center gap-2 whitespace-nowrap"
            >
              {labelKey === "complete" ? busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <DrawnCheck /> : <Send className="h-4 w-4" aria-hidden />}
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
        <span aria-live="polite" className="sr-only">
          {phase === "complete" ? completeLabel : ""}
        </span>
      </button>
    </MotionConfig>
  );
}
