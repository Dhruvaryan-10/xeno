"use client";

/**
 * Adapted from Kokonut UI "Apple Activity Card" v1.1.0 (MIT)
 * https://kokonutui.com · https://github.com/kokonut-labs/kokonutui
 * Changes: rings show campaign rates (never over 100%, so the extra-lap logic is dropped),
 * colours come from the app palette, and values update live as results arrive.
 */

import { useRef } from "react";
import { motion, MotionConfig, useInView } from "motion/react";
import { count, percent } from "@/lib/campaign";

export type Ring = { label: string; value: number; color: string };

const STROKE = 14;
const GAP = 4;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

export function ActivityRings({ rings, total, size = 176 }: { rings: Ring[]; total: number; size?: number }) {
  const center = size / 2;
  const ref = useRef<HTMLDivElement>(null);
  // Draw when scrolled into view, not on mount.
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90" role="img" aria-label={rings.map((ring) => `${ring.label} ${percent(ring.value, total)}`).join(", ")}>
          {rings.map((ring, index) => {
            const radius = center - STROKE / 2 - index * (STROKE + GAP);
            const share = total ? Math.min(ring.value / total, 1) : 0;
            return (
              <g key={ring.label}>
                <circle cx={center} cy={center} r={radius} fill="none" stroke={ring.color} strokeOpacity={0.16} strokeWidth={STROKE} />
                <motion.circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: inView ? share : 0 }}
                  transition={{ duration: 1.1, delay: index * 0.15, ease: EASE_OUT }}
                  style={{ opacity: share ? 1 : 0 }}
                />
              </g>
            );
          })}
        </svg>
        <ul className="grid w-full grid-cols-3 gap-4 sm:w-auto sm:grid-cols-1">
          {rings.map((ring) => (
            <li key={ring.label}>
              <span className="block text-xs text-muted">{ring.label}</span>
              <span className="block text-xl font-semibold tabular-nums" style={{ color: ring.color }}>
                {percent(ring.value, total)}
              </span>
              <span className="block text-xs text-muted tabular-nums">{count(ring.value)} people</span>
            </li>
          ))}
        </ul>
      </div>
    </MotionConfig>
  );
}
