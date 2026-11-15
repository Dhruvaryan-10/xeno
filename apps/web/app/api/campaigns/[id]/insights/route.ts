import { generateInsights } from "@/lib/server/ai";
import { getCampaign } from "@/lib/server/db";
import { handle, NotFoundError, toCampaign } from "@/lib/server/http";

export function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const stored = await getCampaign((await params).id);
    if (!stored) throw new NotFoundError("Campaign not found");
    const campaign = toCampaign(stored);
    return generateInsights(campaign.counts as Record<string, number>, campaign.title);
  });
}
