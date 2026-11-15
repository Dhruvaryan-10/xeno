import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Channel, Filters } from "@/lib/api";
import { CHANNELS } from "@/lib/server/customers";
import { listCampaigns, saveCampaign } from "@/lib/server/db";
import { normalizeFilters } from "@/lib/server/filters";
import { handle, toCampaign } from "@/lib/server/http";

const schema = z.object({
  audiencePrompt: z.string().max(500),
  filters: z.record(z.unknown()),
  title: z.string().trim().min(1).max(120),
  subjectLine: z.string().max(200),
  messageBody: z.string().trim().min(1).max(2000),
  cta: z.string().trim().min(1).max(60),
  channel: z.enum(CHANNELS as [Channel, ...Channel[]]),
  confidence: z.number().min(0).max(1),
  aiReasoning: z.string().max(1000),
  audienceSize: z.number().int().nonnegative(),
  estimatedRevenue: z.number().nonnegative()
});

export function GET() {
  return handle(async () => {
    const now = Date.now();
    return (await listCampaigns(20)).map((campaign) => toCampaign(campaign, now));
  });
}

export function POST(request: Request) {
  return handle(async () => {
    const input = schema.parse(await request.json());
    const campaign = {
      ...input,
      filters: normalizeFilters(input.filters as Partial<Filters>),
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      launchedAt: null,
      recipientIds: []
    };
    await saveCampaign(campaign, true);
    return { id: campaign.id };
  });
}
