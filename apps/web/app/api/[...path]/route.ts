import type { NextRequest } from "next/server";

// Server-side proxy: the browser only talks to this app, so the CRM URL and API key never reach the client.
const CRM_API_URL = process.env.CRM_API_URL ?? "http://localhost:4000";
const CRM_API_KEY = process.env.CRM_API_KEY ?? "";

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${CRM_API_URL}/api/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: { "Content-Type": "application/json", ...(CRM_API_KEY ? { "x-api-key": CRM_API_KEY } : {}) },
      body: hasBody ? await request.text() : undefined,
      cache: "no-store"
    });
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" }
    });
  } catch {
    return Response.json({ error: "CRM API is unreachable" }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST };
