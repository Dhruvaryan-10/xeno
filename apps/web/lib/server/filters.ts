import type { Filters } from "@/lib/api";
import { CHANNELS } from "./customers";

const CITIES = ["mumbai", "delhi", "bengaluru", "hyderabad", "chennai", "pune", "kolkata", "ahmedabad", "jaipur", "lucknow"];

export function normalizeFilters(input: Partial<Filters>): Filters {
  const filters: Filters = {};
  if (Number.isFinite(input.minSpend)) filters.minSpend = Number(input.minSpend);
  if (Number.isFinite(input.maxSpend)) filters.maxSpend = Number(input.maxSpend);
  if (Number.isFinite(input.inactiveDays)) filters.inactiveDays = Number(input.inactiveDays);
  if (input.city) filters.city = String(input.city);
  if (Number.isFinite(input.minAge)) filters.minAge = Number(input.minAge);
  if (Number.isFinite(input.maxAge)) filters.maxAge = Number(input.maxAge);
  if (input.preferredChannel && CHANNELS.includes(input.preferredChannel)) filters.preferredChannel = input.preferredChannel;
  return filters;
}

/** Rule-based reading of an audience sentence, used when Gemini is off or returns something invalid. */
export function fallbackFilters(prompt: string): Filters {
  const lower = prompt.toLowerCase();
  const minSpendMatch = lower.match(/(?:over|above|more than|spent)\s*(?:inr|rs\.?|₹)?\s*([0-9,]+)/);
  const inactiveMatch = lower.match(/(?:not purchased|inactive|no purchase|not bought|haven’t ordered|haven't ordered|not ordered).*?(\d+)\s*days?/);
  return normalizeFilters({
    minSpend: minSpendMatch?.[1] ? Number(minSpendMatch[1].replace(/,/g, "")) : undefined,
    inactiveDays: inactiveMatch?.[1] ? Number(inactiveMatch[1]) : undefined,
    city: CITIES.find((city) => lower.includes(city)),
    preferredChannel: CHANNELS.find((channel) => lower.includes(channel.toLowerCase()))
  });
}
