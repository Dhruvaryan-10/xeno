import { generateCampaignCopy, statsSchema } from "@/lib/server/ai";
import { handle } from "@/lib/server/http";

export function POST(request: Request) {
  return handle(async () => generateCampaignCopy(statsSchema.parse(await request.json())));
}
