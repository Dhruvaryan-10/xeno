import { config } from "dotenv";

// Load the workspace .env first, then the repo-root .env (npm -w runs with the workspace as cwd).
config({ path: [".env", "../../.env"] });
import { createHmac, timingSafeEqual } from "node:crypto";
import axios from "axios";
import express from "express";
import { z } from "zod";

const app = express();
const port = Number(process.env.CHANNEL_PORT ?? process.env.PORT ?? 4100);
const sharedSecret = process.env.CHANNEL_SHARED_SECRET ?? "";
// Callbacks may only go to these origins, so the service cannot be used to hit arbitrary URLs.
const allowedCallbackOrigins = (process.env.ALLOWED_CALLBACK_ORIGINS ?? process.env.CRM_PUBLIC_URL ?? "http://localhost:4000")
  .split(",")
  .map((origin) => new URL(origin.trim()).origin);
const MAX_BATCH = 1000;
const statuses = ["DELIVERED", "OPENED", "CLICKED", "CONVERTED"] as const;

if (!sharedSecret) {
  if (process.env.NODE_ENV === "production") throw new Error("CHANNEL_SHARED_SECRET must be set in production");
  console.warn("[channel-service] CHANNEL_SHARED_SECRET is not set; auth and webhook signing are disabled (dev only).");
}

app.use(express.json({ limit: "2mb" }));

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function authorized(header: string | undefined) {
  if (!sharedSecret) return true;
  const expected = Buffer.from(`Bearer ${sharedSecret}`);
  const actual = Buffer.from(header ?? "");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

async function callback(callbackUrl: string, body: unknown) {
  const json = JSON.stringify(body);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sharedSecret) headers["x-signature"] = createHmac("sha256", sharedSecret).update(json).digest("hex");
  try {
    await axios.post(callbackUrl, json, { headers });
  } catch (error) {
    console.error("Callback failed", error instanceof Error ? error.message : error);
  }
}

async function simulate(communication: { id: string; campaignId: string }, callbackUrl: string) {
  const providerMessageId = `msg_${Math.random().toString(36).slice(2)}`;
  const failed = Math.random() < 0.07;
  await delay(250 + Math.random() * 1200);
  if (failed) {
    await callback(callbackUrl, { communicationId: communication.id, campaignId: communication.campaignId, status: "FAILED", providerMessageId });
    return;
  }

  for (const status of statuses) {
    const chance = status === "OPENED" ? 0.72 : status === "CLICKED" ? 0.36 : status === "CONVERTED" ? 0.14 : 1; // every message that did not fail is delivered
    if (Math.random() <= chance) {
      await callback(callbackUrl, {
        communicationId: communication.id,
        campaignId: communication.campaignId,
        status,
        providerMessageId,
        metadata: { simulated: true, score: Number(Math.random().toFixed(3)) }
      });
      await delay(400 + Math.random() * 2400);
    }
  }
}

app.get("/health", (_req, res) => res.json({ ok: true, service: "channel-service" }));

app.post("/communications/batch", (req, res, next) => {
  try {
    if (!authorized(req.header("authorization"))) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const schema = z.object({
      callbackUrl: z
        .string()
        .url()
        .refine((url) => allowedCallbackOrigins.includes(new URL(url).origin), "callbackUrl origin is not allowed"),
      communications: z
        .array(z.object({ id: z.string(), campaignId: z.string(), channel: z.string(), payload: z.record(z.unknown()) }))
        .max(MAX_BATCH)
    });
    const body = schema.parse(req.body);
    body.communications.forEach((communication) => {
      void simulate(communication, body.callbackUrl);
    });
    res.status(202).json({ accepted: body.communications.length });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof z.ZodError) return res.status(400).json({ error: "Invalid request", issues: error.issues });
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Channel Service running on http://localhost:${port}`);
});
