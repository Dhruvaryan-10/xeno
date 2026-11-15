import type { Channel, Filters, StatusCounts } from "./api";

export const channelNames: Record<Channel, string> = { WHATSAPP: "WhatsApp", SMS: "SMS", EMAIL: "Email", RCS: "RCS" };

// The channel service caps one launch at this many recipients (highest spend first).
export const SEND_LIMIT = 500;

export function inr(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function count(value: number) {
  return value.toLocaleString("en-IN");
}

const titleCase = (value: string) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

/** Plain-language reading of the filters the API understood. */
export function describeFilters(filters: Filters): string[] {
  const parts: string[] = [];
  if (filters.minSpend !== undefined) parts.push(`Spent over ${inr(filters.minSpend)}`);
  if (filters.maxSpend !== undefined) parts.push(`Spent under ${inr(filters.maxSpend)}`);
  if (filters.inactiveDays !== undefined) parts.push(`No purchase in ${filters.inactiveDays}+ days`);
  if (filters.city) parts.push(`Lives in ${titleCase(filters.city)}`);
  if (filters.minAge !== undefined && filters.maxAge !== undefined) parts.push(`Aged ${filters.minAge} to ${filters.maxAge}`);
  else if (filters.minAge !== undefined) parts.push(`Aged ${filters.minAge}+`);
  else if (filters.maxAge !== undefined) parts.push(`Aged under ${filters.maxAge}`);
  if (filters.preferredChannel) parts.push(`Prefers ${channelNames[filters.preferredChannel]}`);
  return parts;
}

export type FunnelStage = { label: string; value: number };

/**
 * Each message stores only its latest status, so a stage's total is every message
 * that reached that stage or a later one.
 */
export function funnel(counts: StatusCounts) {
  const c = (key: keyof StatusCounts) => counts[key] ?? 0;
  const converted = c("CONVERTED");
  const clicked = converted + c("CLICKED");
  const opened = clicked + c("OPENED");
  const delivered = opened + c("DELIVERED");
  const failed = c("FAILED");
  const total = delivered + failed + c("SENT") + c("QUEUED");
  const stages: FunnelStage[] = [
    { label: "Delivered", value: delivered },
    { label: "Opened", value: opened },
    { label: "Clicked", value: clicked },
    { label: "Converted", value: converted }
  ];
  return { total, pending: c("QUEUED"), failed, stages };
}

export function percent(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "0%";
}

export function personalize(text: string, name: string) {
  return text.replaceAll("{{name}}", name);
}

export function daysSince(iso: string | null) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function relativeTime(iso: string) {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
