export function GET() {
  const database = Boolean(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL);
  return Response.json({ ok: true, database: database ? "redis" : "memory", ai: process.env.GEMINI_API_KEY ? "gemini" : "fallback" });
}
