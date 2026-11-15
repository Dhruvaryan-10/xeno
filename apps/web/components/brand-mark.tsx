// Same three-arc mark as the app icon (scripts/make-icons.mjs).
const arcs = [
  { r: 9, color: "#FF6B5E", sweep: 0.82 },
  { r: 6.3, color: "#E0457B", sweep: 0.64 },
  { r: 3.6, color: "#FDA1A2", sweep: 0.4 }
];

export function BrandMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 30" className={className} aria-hidden>
      <rect width="30" height="30" rx="7" fill="#1D1842" />
      {arcs.map(({ r, color, sweep }) => {
        const circumference = 2 * Math.PI * r;
        return (
          <circle
            key={r}
            cx="15"
            cy="15"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${circumference * sweep} ${circumference}`}
            transform="rotate(-90 15 15)"
          />
        );
      })}
    </svg>
  );
}
