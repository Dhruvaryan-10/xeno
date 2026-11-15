import { customerById } from "@/lib/server/customers";
import { getCampaign } from "@/lib/server/db";
import { handle, NotFoundError, toCampaign } from "@/lib/server/http";
import { recentEvents } from "@/lib/server/simulate";

export function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const stored = await getCampaign((await params).id);
    if (!stored) throw new NotFoundError("Campaign not found");
    const now = Date.now();
    const launched = stored.launchedAt ? new Date(stored.launchedAt).getTime() : null;
    const events =
      launched === null
        ? []
        : recentEvents(stored.id, stored.recipientIds, launched, now).map((event) => ({
            id: `${event.customerId}:${event.status}`,
            status: event.status,
            occurredAt: new Date(event.at).toISOString(),
            customerName: customerById(event.customerId)?.name ?? null
          }));
    return { ...toCampaign(stored, now), events };
  });
}
