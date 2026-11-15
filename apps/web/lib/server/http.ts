import { ZodError } from "zod";
import type { Campaign } from "@/lib/api";
import type { StoredCampaign } from "./db";
import { countsAt, isFinished } from "./simulate";

export class NotFoundError extends Error {}

/** Runs a route handler, mapping validation errors to 400, missing records to 404 and anything else to 500. */
export async function handle(run: () => Promise<unknown>) {
  try {
    return Response.json(await run());
  } catch (error) {
    if (error instanceof ZodError) return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    if (error instanceof NotFoundError) return Response.json({ error: error.message }, { status: 404 });
    console.error(error);
    return Response.json({ error: "Something went wrong on the server. Try again." }, { status: 500 });
  }
}

/** The public view of a campaign, with its results as of `now`. */
export function toCampaign(stored: StoredCampaign, now = Date.now()): Campaign {
  const { recipientIds, filters: _filters, confidence: _confidence, aiReasoning: _reasoning, ...rest } = stored;
  const launched = stored.launchedAt ? new Date(stored.launchedAt).getTime() : null;
  return {
    ...rest,
    status: launched === null ? "DRAFT" : isFinished(stored.id, recipientIds, launched, now) ? "SENT" : "SENDING",
    counts: launched === null ? {} : countsAt(stored.id, recipientIds, launched, now)
  };
}
