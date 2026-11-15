"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronRight, Loader2, Sparkles } from "lucide-react";
import { api, type Campaign, type CampaignDetail, type Insights, type Status } from "@/lib/api";
import { channelNames, count, funnel, percent, relativeTime } from "@/lib/campaign";
import { cn } from "@/lib/utils";
import { ActivityRings } from "@/components/activity-rings";
import { Button } from "@/components/ui/button";

const POLL_MS = 4000;
const statusText: Record<Campaign["status"], string> = { DRAFT: "Draft", SENDING: "Sending", SENT: "Sent", PAUSED: "Paused" };
const eventText: Record<Status, string> = {
  QUEUED: "queued",
  SENT: "sent",
  DELIVERED: "received it",
  FAILED: "couldn’t be reached",
  OPENED: "opened it",
  CLICKED: "tapped the button",
  CONVERTED: "made a purchase"
};

/** Polls while the section is open and the tab is visible. */
function usePolling(task: () => Promise<void>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    void task();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void task();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [task, enabled]);
}

export function CampaignsView({
  active,
  selectedId,
  onSelect,
  justSent,
  onCreate
}: {
  active: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  justSent: boolean;
  onCreate: () => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const next = await api.campaigns();
      setCampaigns(next);
      setError("");
      if (!selectedId && next[0]) onSelect(next[0].id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn’t load campaigns.");
    }
  }, [selectedId, onSelect]);

  usePolling(load, active);

  if (campaigns === null) {
    return error ? <ErrorNote message={error} /> : <p className="text-muted">Loading campaigns…</p>;
  }

  if (campaigns.length === 0) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <p className="mt-2 text-muted">Nothing has been sent yet. Results show up here as customers respond.</p>
        <Button className="mt-6" onClick={onCreate}>
          Create a campaign
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Campaigns</h1>
      {justSent ? <p className="mt-1 font-medium text-accent">Sent. Results update here as customers respond.</p> : null}
      {error ? <ErrorNote message={error} /> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-8">
        <ul className="self-start divide-y overflow-hidden rounded-cell bg-surface" aria-label="Campaigns">
          {campaigns.map((campaign) => {
            const stats = funnel(campaign.counts);
            const selected = campaign.id === selectedId;
            return (
              <li key={campaign.id}>
                <button
                  type="button"
                  onClick={() => onSelect(campaign.id)}
                  aria-current={selected ? "true" : undefined}
                  className={cn("flex w-full items-center gap-3 px-4 py-3 text-left transition-colors", selected ? "bg-accent/10" : "hover:bg-ink/[0.03]")}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{campaign.title}</span>
                    <span className="block text-sm text-muted">
                      {channelNames[campaign.channel]}, {count(stats.total)} people
                      {campaign.launchedAt ? `, ${relativeTime(campaign.launchedAt)}` : ""}
                    </span>
                  </span>
                  <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", campaign.status === "SENDING" ? "bg-ring-3/15 text-ink" : "bg-accent/10 text-accent")}>
                    {statusText[campaign.status]}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted/60" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>

        {selectedId ? <CampaignResults key={selectedId} id={selectedId} active={active} /> : null}
      </div>
    </div>
  );
}

function CampaignResults({ id, active }: { id: string; active: boolean }) {
  const [detail, setDetail] = useState<CampaignDetail | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setDetail(await api.campaign(id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn’t load this campaign.");
    }
  }, [id]);

  usePolling(load, active);

  async function analyse() {
    setAnalysing(true);
    setError("");
    try {
      setInsights(await api.insights(id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn’t analyse this campaign.");
    } finally {
      setAnalysing(false);
    }
  }

  if (!detail) return error ? <ErrorNote message={error} /> : <p className="text-muted">Loading results…</p>;

  const stats = funnel(detail.counts);
  const [delivered, opened, clicked, bought] = stats.stages.map((stage) => stage.value) as [number, number, number, number];

  return (
    <section aria-labelledby="results-title" className="min-w-0 space-y-4">
      <div className="rounded-cell bg-surface p-5">
        <h2 id="results-title" className="text-xl font-bold">
          {detail.title}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {channelNames[detail.channel]} to {count(stats.total)} customers{detail.launchedAt ? `, sent ${relativeTime(detail.launchedAt)}` : ""}
        </p>
        <p className="mt-2 text-sm text-muted">“{detail.audiencePrompt}”</p>

        <div className="mt-6">
          <ActivityRings
            total={stats.total}
            rings={[
              { label: "Delivered", value: delivered, color: "rgb(var(--ring-1))" },
              { label: "Opened", value: opened, color: "rgb(var(--ring-2))" },
              { label: "Bought", value: bought, color: "rgb(var(--ring-3))" }
            ]}
          />
        </div>
        <p className="mt-5 border-t pt-4 text-sm text-muted">
          {count(clicked)} tapped the button ({percent(clicked, stats.total)}). {count(stats.failed)} couldn’t be reached
          {stats.pending ? `, ${count(stats.pending)} still waiting on the provider` : ""}.
        </p>
      </div>

      <div className="rounded-cell bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold">What to try next</h3>
          <Button variant="secondary" size="sm" onClick={analyse} disabled={analysing}>
            {analysing ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
            {insights ? "Analyse again" : "Analyse results"}
          </Button>
        </div>
        {error ? <ErrorNote message={error} /> : null}
        {insights ? (
          <div className="mt-3 max-w-prose">
            <p>{insights.summary}</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 marker:text-accent">
              {insights.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {insights.risks.length ? <p className="mt-3 text-sm text-muted">Watch out: {insights.risks.join(" ")}</p> : null}
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">Get suggestions based on how this campaign has done so far.</p>
        )}
      </div>

      <div className="rounded-cell bg-surface p-5">
        <h3 className="text-base font-semibold">Latest responses</h3>
        {detail.events.length ? (
          <ul className="mt-2 divide-y">
            {detail.events.slice(0, 8).map((event) => (
              <li key={event.id} className="flex justify-between gap-4 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="font-semibold">{event.customerName ?? "A customer"}</span> {eventText[event.status]}
                </span>
                <span className="whitespace-nowrap text-xs text-muted">{relativeTime(event.occurredAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">Waiting for the first delivery reports.</p>
        )}
      </div>
    </section>
  );
}

function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-3 text-sm text-danger">
      {message}
    </p>
  );
}
