import * as React from "react";
import { cn } from "@/lib/utils";

// Fields sit borderless inside grouped rows, like an iOS form.
export const fieldClass = "w-full bg-transparent text-base text-ink placeholder:text-muted/70 focus-visible:outline-none";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(fieldClass, "h-7", className)} {...props} />
));
Input.displayName = "Input";

/** A rounded group of rows separated by hairlines (iOS inset grouped list). */
export function Group({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("divide-y overflow-hidden rounded-cell bg-surface", className)}>{children}</div>;
}

/** One labelled row in a Group. The whole row focuses its field. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block px-4 py-3 focus-within:bg-accent/[0.04]">
      <span className="block text-xs font-medium text-muted">{label}</span>
      <span className="mt-1 block">{children}</span>
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
