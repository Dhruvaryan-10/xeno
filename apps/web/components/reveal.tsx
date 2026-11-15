"use client";

import { motion, MotionConfig } from "motion/react";
import type { HTMLAttributes, ReactNode } from "react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Motion redefines these handlers with different signatures, so they can't be passed through.
type PassThrough = Omit<HTMLAttributes<HTMLElement>, "children" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd">;

/** Fades and lifts its children in the first time they scroll into view. Reduced motion keeps only the fade. */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  ...rest
}: PassThrough & { children: ReactNode; delay?: number; as?: "div" | "li" | "article" | "section" }) {
  const Tag = motion[as];
  return (
    <MotionConfig reducedMotion="user">
      <Tag
        {...rest}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      >
        {children}
      </Tag>
    </MotionConfig>
  );
}
