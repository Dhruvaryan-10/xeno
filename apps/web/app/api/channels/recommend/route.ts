import { recommendChannel, statsSchema } from "@/lib/server/ai";
import { handle } from "@/lib/server/http";

export function POST(request: Request) {
  return handle(async () => recommendChannel(statsSchema.parse(await request.json())));
}
