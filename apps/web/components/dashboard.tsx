"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, ChevronRight, Plus } from "lucide-react";
import { api, type Campaign, type Customer } from "@/lib/api";
import { channelNames, count, funnel, inr, percent, relativeTime } from "@/lib/campaign";
import { ActivityRings } from "@/components/activity-rings";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

const POLL_MS = 5000;
const tile = "rounded-[1.75rem] bg-surface p-5 sm:p-6";

export function Dashboard({
  active,
  onNewCampaign,
  onOpenCampaign,
  onOpenCustomers
}: {
  active: boolean;
  onNewCampaign: () => void;
  onOpenCampaign: (id: string) => void;
  onOpenCustomers: () => void;
}) {
  const [campaigns, setCampaigns] = useState<Campaign[] | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [nextCampaigns, nextCustomers] = await Promise.all([api.campaigns(), api.customers(5)]);
      setCampaigns(nextCampaigns);
      setCustomers(nextCustomers);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn’t load the dashboard.");
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    void load();
    const id = setInterval(() => document.visibilityState === "visible" && void load(), POLL_MS);
    return () => clearInterval(id);
  }, [active, load]);

  const totals = (campaigns ?? []).reduce(
    (sum, campaign) => {
      const stats = funnel(campaign.counts);
      return { reached: sum.reached + stats.total, opened: sum.opened + stats.stages[1]!.value, bought: sum.bought + stats.stages[3]!.value };
    },
    { reached: 0, opened: 0, bought: 0 }
  );
  const latest = campaigns?.[0];
  const latestStats = latest ? funnel(latest.counts) : null;
  const campaignCount = campaigns?.length ?? 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-muted">{campaignCount === 0 ? "Send your first campaign to see results here." : campaignCount === 1 ? "How your campaign is doing." : `How your last ${campaignCount} campaigns are doing.`}</p>
        </div>
      </div>
      {error ? (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat delay={0} label="People reached" value={count(totals.reached)} note={`across ${campaignCount} ${campaignCount === 1 ? "campaign" : "campaigns"}`} />
        <Stat delay={0.06} label="Opened" value={percent(totals.opened, totals.reached)} note={`${count(totals.opened)} people`} />
        <Stat delay={0.12} label="Bought" value={percent(totals.bought, totals.reached)} note={`${count(totals.bought)} purchases`} />

        <button
          type="button"
          onClick={onNewCampaign}
          className="group relative flex min-h-[9.5rem] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-accent p-5 text-left text-accent-ink transition-transform active:scale-[0.98] sm:p-6"
        >
          <span className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/15 blur-2xl transition-transform group-hover:scale-125" aria-hidden />
          <Plus className="h-7 w-7" aria-hidden />
          <span>
            <span className="block text-xl font-bold">New campaign</span>
            <span className="block text-sm opacity-90">Describe who, we’ll do the rest</span>
          </span>
        </button>

        <Reveal as="section" delay={0.18} aria-labelledby="recent-title" className={`${tile} sm:col-span-2 xl:row-span-2`}>
          <div className="flex items-center justify-between">
            <h2 id="recent-title" className="text-base font-semibold">
              Recent campaigns
            </h2>
          </div>
          {campaigns === null ? (
            <p className="mt-4 text-sm text-muted">Loading…</p>
          ) : campaigns.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nothing sent yet. Start with “New campaign” and results will appear here.</p>
          ) : (
            <ul className="mt-3 divide-y">
              {campaigns.slice(0, 6).map((campaign) => {
                const stats = funnel(campaign.counts);
                return (
                  <li key={campaign.id}>
                    <button type="button" onClick={() => onOpenCampaign(campaign.id)} className="-mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-ink/[0.03]">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent/10 text-sm font-bold text-accent">{campaign.title.charAt(0)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{campaign.title}</span>
                        <span className="block text-sm text-muted">
                          {channelNames[campaign.channel]}, {campaign.launchedAt ? relativeTime(campaign.launchedAt) : "draft"}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-semibold tabular-nums">{percent(stats.stages[3]!.value, stats.total)}</span>
                        <span className="block text-xs text-muted">bought</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted/60" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Reveal>

        <Reveal as="section" delay={0.24} aria-labelledby="latest-title" className={`${tile} sm:col-span-2`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="latest-title" className="text-base font-semibold">
                Latest campaign
              </h2>
              <p className="truncate text-sm text-muted">{latest ? latest.title : "No campaigns yet"}</p>
            </div>
            {latest ? (
              <Button variant="secondary" size="sm" onClick={() => onOpenCampaign(latest.id)}>
                Details
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Button>
            ) : null}
          </div>
          {latest && latestStats ? (
            <div className="mt-5">
              <ActivityRings
                size={150}
                total={latestStats.total}
                rings={[
                  { label: "Delivered", value: latestStats.stages[0]!.value, color: "rgb(var(--ring-1))" },
                  { label: "Opened", value: latestStats.stages[1]!.value, color: "rgb(var(--ring-2))" },
                  { label: "Bought", value: latestStats.stages[3]!.value, color: "rgb(var(--ring-3))" }
                ]}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Results show up here as customers respond.</p>
          )}
        </Reveal>

        <Reveal as="section" delay={0.30} aria-labelledby="top-title" className={`${tile} sm:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 id="top-title" className="text-base font-semibold">
              Top customers
            </h2>
            <Button variant="quiet" size="sm" onClick={onOpenCustomers}>
              See all
            </Button>
          </div>
          <ul className="mt-2 divide-y">
            {customers.map((customer, index) => (
              <li key={customer.id} className="flex items-center gap-3 py-2.5">
                <span className="w-5 text-sm font-semibold tabular-nums text-muted">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{customer.name}</span>
                  <span className="block text-xs text-muted">{customer.city}</span>
                </span>
                <span className="font-semibold tabular-nums">{inr(customer.totalSpend)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}

function Stat({ label, value, note, delay }: { label: string; value: string; note: string; delay: number }) {
  return (
    <Reveal delay={delay} className={`${tile} flex min-h-[9.5rem] flex-col justify-between`}>
      <span className="text-sm font-medium text-muted">{label}</span>
      <span>
        <span className="block text-[2.5rem] font-bold leading-none tracking-tight">{value}</span>
        <span className="mt-1.5 block text-sm text-muted">{note}</span>
      </span>
    </Reveal>
  );
}
