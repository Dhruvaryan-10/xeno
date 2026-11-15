import { z } from "zod";
import { parseAudiencePrompt } from "@/lib/server/ai";
import { findCustomers } from "@/lib/server/customers";
import { handle } from "@/lib/server/http";

const schema = z.object({ prompt: z.string().trim().min(5).max(500) });

export function POST(request: Request) {
  return handle(async () => {
    const { prompt } = schema.parse(await request.json());
    const filters = await parseAudiencePrompt(prompt);
    const audience = findCustomers(filters);
    const audienceSize = audience.length;
    const averageSpend = Number((audience.reduce((sum, customer) => sum + customer.totalSpend, 0) / Math.max(audienceSize, 1)).toFixed(2));
    // Assumes 8% of the audience buys again at their average spend (shown as such in the UI).
    const estimatedRevenue = Number((audienceSize * averageSpend * 0.08).toFixed(2));
    return { filters, audienceSize, averageSpend, estimatedRevenue, sampleCustomers: audience.slice(0, 10) };
  });
}
