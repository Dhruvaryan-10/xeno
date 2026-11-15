export type Channel = "WHATSAPP" | "SMS" | "EMAIL" | "RCS";
export type Status = "QUEUED" | "SENT" | "DELIVERED" | "FAILED" | "OPENED" | "CLICKED" | "CONVERTED";
export type StatusCounts = Partial<Record<Status, number>>;

export type Filters = {
  minSpend?: number;
  maxSpend?: number;
  inactiveDays?: number;
  city?: string;
  minAge?: number;
  maxAge?: number;
  preferredChannel?: Channel;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  age: number;
  totalSpend: number;
  lastPurchaseDate: string | null;
  preferredChannel: Channel;
};

export type AudiencePreview = {
  filters: Filters;
  audienceSize: number;
  averageSpend: number;
  estimatedRevenue: number;
  sampleCustomers: Customer[];
};

export type CampaignCopy = {
  title: string;
  subjectLine: string;
  messageBody: string;
  cta: string;
};

export type Recommendation = {
  channel: Channel;
  confidence: number;
  reasoning: string;
};

export type Campaign = CampaignCopy & {
  id: string;
  channel: Channel;
  status: "DRAFT" | "SENDING" | "SENT" | "PAUSED";
  audiencePrompt: string;
  audienceSize: number;
  estimatedRevenue: number;
  createdAt: string;
  launchedAt: string | null;
  counts: StatusCounts;
};

export type CampaignEvent = { id: string; status: Status; occurredAt: string; customerName: string | null };
export type CampaignDetail = Campaign & { events: CampaignEvent[] };
export type Insights = { summary: string; recommendations: string[]; risks: string[] };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // Same-origin call to the Next.js proxy in app/api/[...path]/route.ts.
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store"
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

export const api = {
  previewAudience: (prompt: string) => request<AudiencePreview>("/audiences/preview", post({ prompt })),
  generateCopy: (body: { prompt: string; audienceSize: number; averageSpend: number; channel?: Channel }) =>
    request<CampaignCopy>("/campaigns/generate", post(body)),
  recommendChannel: (body: { prompt: string; audienceSize: number; averageSpend: number }) => request<Recommendation>("/channels/recommend", post(body)),
  createCampaign: (body: Record<string, unknown>) => request<{ id: string }>("/campaigns", post(body)),
  launchCampaign: (id: string) => request<{ launched: boolean; sent: number }>(`/campaigns/${id}/launch`, { method: "POST" }),
  campaigns: () => request<Campaign[]>("/campaigns"),
  campaign: (id: string) => request<CampaignDetail>(`/campaigns/${id}`),
  insights: (id: string) => request<Insights>(`/campaigns/${id}/insights`),
  customers: (take = 100) => request<Customer[]>(`/customers?take=${take}`)
};
