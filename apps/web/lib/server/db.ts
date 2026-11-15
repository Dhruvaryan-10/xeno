import { Redis } from "@upstash/redis";
import type { CampaignCopy, Channel, Filters } from "@/lib/api";

/** A campaign as stored. Results aren't stored: they're computed from `recipientIds` and `launchedAt`. */
export type StoredCampaign = CampaignCopy & {
  id: string;
  channel: Channel;
  audiencePrompt: string;
  filters: Filters;
  audienceSize: number;
  estimatedRevenue: number;
  confidence: number;
  aiReasoning: string;
  createdAt: string;
  launchedAt: string | null;
  recipientIds: string[];
};

const LIST = "campaigns";
const key = (id: string) => `campaign:${id}`;
const MAX_CAMPAIGNS = 200;

// The Vercel Upstash integration sets KV_REST_API_*; a direct Upstash account sets UPSTASH_REDIS_REST_*.
const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

if (!redis && process.env.VERCEL) {
  console.error("[db] No Redis configured. Add Upstash Redis from the Vercel Storage tab; campaigns will not persist.");
}

// shortcut: without Redis (local dev), campaigns live in this process's memory and vanish on restart.
const memory = new Map<string, StoredCampaign>();
const memoryOrder: string[] = [];

export async function saveCampaign(campaign: StoredCampaign, isNew: boolean) {
  if (redis) {
    await redis.set(key(campaign.id), campaign);
    if (isNew) {
      await redis.lpush(LIST, campaign.id);
      await redis.ltrim(LIST, 0, MAX_CAMPAIGNS - 1);
    }
    return;
  }
  memory.set(campaign.id, campaign);
  if (isNew) memoryOrder.unshift(campaign.id);
}

export async function getCampaign(id: string): Promise<StoredCampaign | null> {
  if (redis) return redis.get<StoredCampaign>(key(id));
  return memory.get(id) ?? null;
}

export async function listCampaigns(take: number): Promise<StoredCampaign[]> {
  if (redis) {
    const ids = await redis.lrange<string>(LIST, 0, take - 1);
    if (!ids.length) return [];
    const rows = (await redis.mget(...ids.map(key))) as (StoredCampaign | null)[];
    return rows.filter((row): row is StoredCampaign => row !== null);
  }
  return memoryOrder.slice(0, take).flatMap((id) => memory.get(id) ?? []);
}
