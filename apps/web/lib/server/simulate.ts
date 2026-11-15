import type { Status, StatusCounts } from "@/lib/api";

/**
 * Simulated message delivery with no background jobs: each recipient's timeline (delivered, opened,
 * clicked, bought, or failed) is derived from a hash of the campaign and customer IDs, so every server
 * computes the same answer. Reading a campaign "now" reveals the events whose time has passed.
 */

export type TimelineEvent = { status: Status; at: number };

const FAIL_RATE = 0.07;
const STAGES: Array<{ status: Status; chance: number }> = [
  { status: "OPENED", chance: 0.72 },
  { status: "CLICKED", chance: 0.36 },
  { status: "CONVERTED", chance: 0.14 }
];

// FNV-1a hash -> mulberry32 PRNG: small, fast and deterministic.
function seedFrom(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function random(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Every event one recipient will produce, with absolute times (ms). */
export function timeline(campaignId: string, customerId: string, launchedAt: number): TimelineEvent[] {
  const next = random(seedFrom(`${campaignId}:${customerId}`));
  let at = launchedAt + 1000 + next() * 4000;
  if (next() < FAIL_RATE) return [{ status: "FAILED", at }];
  const events: TimelineEvent[] = [{ status: "DELIVERED", at }];
  for (const stage of STAGES) {
    if (next() > stage.chance) break;
    at += 2000 + next() * 10000;
    events.push({ status: stage.status, at });
  }
  return events;
}

/** Each recipient's latest status at `now`, counted. Not-yet-delivered messages are QUEUED. */
export function countsAt(campaignId: string, recipientIds: string[], launchedAt: number, now: number): StatusCounts {
  const counts: StatusCounts = {};
  for (const customerId of recipientIds) {
    const reached = timeline(campaignId, customerId, launchedAt).filter((event) => event.at <= now);
    const status: Status = reached.at(-1)?.status ?? "QUEUED";
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

/** True once every recipient's timeline has finished. */
export function isFinished(campaignId: string, recipientIds: string[], launchedAt: number, now: number) {
  return recipientIds.every((customerId) => (timeline(campaignId, customerId, launchedAt).at(-1)?.at ?? 0) <= now);
}

/** The most recent events that have happened by `now`, newest first. */
export function recentEvents(campaignId: string, recipientIds: string[], launchedAt: number, now: number, take = 30) {
  return recipientIds
    .flatMap((customerId) =>
      timeline(campaignId, customerId, launchedAt)
        .filter((event) => event.at <= now)
        .map((event) => ({ ...event, customerId }))
    )
    .sort((a, b) => b.at - a.at)
    .slice(0, take);
}
