import { config } from "dotenv";

// Load the workspace .env first, then the repo-root .env (npm -w runs with the workspace as cwd).
config({ path: [".env", "../../.env"] });

const isProduction = process.env.NODE_ENV === "production";

function secret(name: string) {
  const value = process.env[name] ?? "";
  if (!value && isProduction) throw new Error(`${name} must be set in production`);
  if (!value) console.warn(`[crm-api] ${name} is not set; this check is disabled (dev only).`);
  return value;
}

export const env = {
  port: Number(process.env.CRM_PORT ?? process.env.PORT ?? 4000),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  channelServiceUrl: process.env.CHANNEL_SERVICE_URL ?? "http://localhost:4100",
  crmPublicUrl: process.env.CRM_PUBLIC_URL ?? "http://localhost:4000",
  // Point this at a persistent disk in production; most PaaS filesystems are wiped on redeploy.
  dataFile: process.env.DATA_FILE ?? "data/store.json",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((origin) => origin.trim()),
  // Required on every /api call except /health and the signed webhook.
  apiKey: secret("CRM_API_KEY"),
  // Shared with the channel service: authenticates CRM -> channel calls and signs channel -> CRM webhooks.
  channelSecret: secret("CHANNEL_SHARED_SECRET")
};
