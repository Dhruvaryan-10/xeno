import type { Config } from "tailwindcss";

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        ink: token("ink"),
        muted: token("muted"),
        rule: token("rule"),
        accent: { DEFAULT: token("accent"), ink: token("accent-ink") },
        "ring-1": token("ring-1"),
        "ring-2": token("ring-2"),
        "ring-3": token("ring-3"),
        danger: token("danger"),
        indigo: token("indigo")
      },
      // The platform's own typeface: SF Pro on Apple devices, Segoe UI on Windows, Roboto on Android.
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "\"SF Pro Text\"", "\"Segoe UI\"", "Roboto", "\"Helvetica Neue\"", "Arial", "sans-serif"]
      },
      // Apple text styles: footnote 13, subheadline 15, body 17, title 2 22, title 1 28, large title 34.
      fontSize: {
        xs: ["0.8125rem", { lineHeight: "1.125rem" }],
        sm: ["0.9375rem", { lineHeight: "1.25rem" }],
        base: ["1.0625rem", { lineHeight: "1.375rem", letterSpacing: "-0.01em" }],
        lg: ["1.375rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em" }],
        xl: ["1.75rem", { lineHeight: "2.125rem", letterSpacing: "-0.015em" }],
        "2xl": ["2.125rem", { lineHeight: "2.5625rem", letterSpacing: "-0.02em" }]
      },
      borderRadius: {
        cell: "0.875rem"
      }
    }
  }
};

export default config;
