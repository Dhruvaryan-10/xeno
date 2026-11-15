import { SEND_LIMIT } from "@/lib/campaign";
import { findCustomers } from "@/lib/server/customers";
import { getCampaign, saveCampaign } from "@/lib/server/db";
import { handle, NotFoundError } from "@/lib/server/http";

export function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const campaign = await getCampaign((await params).id);
    if (!campaign) throw new NotFoundError("Campaign not found");
    // Launching twice is a no-op, so a retried request can't send the campaign again.
    if (campaign.launchedAt) return { launched: true, sent: campaign.recipientIds.length };

    const recipientIds = findCustomers(campaign.filters)
      .slice(0, SEND_LIMIT)
      .map((customer) => customer.id);
    await saveCampaign({ ...campaign, recipientIds, launchedAt: new Date().toISOString() }, false);
    return { launched: true, sent: recipientIds.length };
  });
}
