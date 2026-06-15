import "dotenv/config";

export const env = {
  port: Number(process.env.CRM_PORT ?? process.env.PORT ?? 4000),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  channelServiceUrl: process.env.CHANNEL_SERVICE_URL ?? "https://xeno-assignment-1-usxp.onrender.com",
  crmPublicUrl: process.env.CRM_PUBLIC_URL ?? "https://xeno-assignment-vbo2.onrender.com"
};
