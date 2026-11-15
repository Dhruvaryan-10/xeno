"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ArrowLeft, Loader2, Mail, MessageCircle, MessageSquareText, Smartphone, Sparkles, X } from "lucide-react";
import { api, type AudiencePreview, type CampaignCopy, type Channel, type Recommendation } from "@/lib/api";
import { channelNames, count, describeFilters, inr, SEND_LIMIT } from "@/lib/campaign";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Group, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HoldButton } from "@/components/hold-button";
import { MessagePreview } from "@/components/message-preview";

const emptyCopy: CampaignCopy = { title: "", subjectLine: "", messageBody: "", cta: "" };
const examples = [
  "Spent over ₹5,000 and inactive for 60 days",
  "WhatsApp customers in Mumbai who spent above ₹20,000",
  "Customers in Bengaluru with no purchase in 90 days"
];
const steps = ["Audience", "Message", "Channel", "Review"] as const;
const channelIcons = { WHATSAPP: MessageCircle, SMS: MessageSquareText, EMAIL: Mail, RCS: Smartphone } satisfies Record<Channel, unknown>;
const channels = Object.keys(channelNames) as Channel[];

type Busy = "audience" | "draft" | "send" | null;

/** Full-screen, one-step-per-screen flow for creating and sending a campaign. */
export function CampaignWizard({ onClose, onSent }: { onClose: () => void; onSent: (campaignId: string) => void }) {
  const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState<AudiencePreview | null>(null);
  const [copy, setCopy] = useState<CampaignCopy>(emptyCopy);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [channel, setChannel] = useState<Channel>("WHATSAPP");
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);

  const recipients = Math.min(audience?.audienceSize ?? 0, SEND_LIMIT);
  const readable = audience ? describeFilters(audience.filters) : [];
  const messageReady = Boolean(copy.title.trim() && copy.messageBody.trim() && copy.cta.trim());
  const canContinue = busy === null && (step === 0 ? recipients > 0 : step === 1 ? messageReady : step === 2);
  const dirty = Boolean(prompt.trim() || copy.messageBody.trim());

  // Move focus to the new step's heading so keyboard and screen reader users land in the right place.
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0 });
  }, [step]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function close() {
    if (dirty && !window.confirm("Discard this campaign? What you’ve written won’t be kept.")) return;
    onClose();
  }

  async function run(kind: Exclude<Busy, null>, task: () => Promise<void>) {
    setBusy(kind);
    setError("");
    try {
      await task();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  }

  function findCustomers(event: FormEvent) {
    event.preventDefault();
    if (prompt.trim().length < 5) {
      setError("Describe the audience in a few more words, for example how much they spent or where they live.");
      return;
    }
    void run("audience", async () => {
      const next = await api.previewAudience(prompt);
      setAudience(next);
      const stats = { prompt, audienceSize: next.audienceSize, averageSpend: next.averageSpend };
      const [rec, draft] = await Promise.all([
        api.recommendChannel(stats),
        // Keep anything the marketer has already written.
        copy.messageBody.trim() ? Promise.resolve(null) : api.generateCopy(stats)
      ]);
      setRecommendation(rec);
      setChannel(rec.channel);
      if (draft) setCopy(draft);
    });
  }

  function writeDraft() {
    void run("draft", async () => {
      setCopy(await api.generateCopy({ prompt, audienceSize: audience?.audienceSize ?? 0, averageSpend: audience?.averageSpend ?? 0, channel }));
    });
  }

  function send() {
    if (!audience) return;
    void run("send", async () => {
      const campaign = await api.createCampaign({
        audiencePrompt: prompt,
        filters: audience.filters,
        audienceSize: audience.audienceSize,
        estimatedRevenue: audience.estimatedRevenue,
        ...copy,
        channel,
        confidence: recommendation?.confidence ?? 0,
        aiReasoning: recommendation?.reasoning ?? ""
      });
      await api.launchCampaign(campaign.id);
      onSent(campaign.id);
    });
  }

  const preview = <MessagePreview channel={channel} copy={copy} audience={audience} recipients={recipients} />;

  return (
    <MotionConfig reducedMotion="user">
      <div role="dialog" aria-modal="true" aria-label="New campaign" className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-bg pt-[env(safe-area-inset-top)]">
        <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
            <button type="button" onClick={close} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full hover:bg-ink/5">
              <X className="h-5 w-5" aria-hidden />
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">New campaign</p>
              <p className="text-xs text-muted">
                Step {step + 1} of {steps.length}: {steps[step]}
              </p>
            </div>
          </div>
          <div className="h-1 bg-ink/[0.06]" aria-hidden>
            <motion.div className="h-full bg-accent" initial={{ width: 0 }} animate={{ width: `${((step + 1) / steps.length) * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 30 }} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-36 pt-8 sm:px-6 lg:pt-12">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
              {step === 0 ? (
                <StepLayout headingRef={heading} title="Who should get this?" lead="Describe the customers the way you’d say it to a colleague.">
                  <form onSubmit={findCustomers} className="max-w-3xl">
                    <label htmlFor="audience-prompt" className="sr-only">
                      Describe the audience
                    </label>
                    <textarea
                      id="audience-prompt"
                      rows={2}
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) findCustomers(event);
                      }}
                      placeholder="Customers in Pune who spent over ₹10,000"
                      className="min-h-[6rem] w-full resize-none overflow-hidden border-b-2 border-rule bg-transparent pb-4 text-2xl font-semibold leading-tight tracking-tight [field-sizing:content] placeholder:font-normal placeholder:text-muted/50 focus-visible:border-accent focus-visible:outline-none sm:text-4xl"
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      {examples.map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => setPrompt(example)}
                          className="rounded-full bg-surface px-3.5 py-2 text-left text-sm text-muted ring-1 ring-rule transition-colors hover:text-accent hover:ring-accent/40"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                    <Button type="submit" size="lg" className="mt-6" disabled={busy !== null}>
                      {busy === "audience" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                      {busy === "audience" ? "Finding customers" : "Find customers"}
                    </Button>
                  </form>

                  {audience ? (
                    <div className="mt-10 grid gap-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]" aria-live="polite">
                      <div className="rounded-[1.75rem] bg-accent p-6 text-accent-ink">
                        <p className="text-5xl font-bold tracking-tight">{count(audience.audienceSize)}</p>
                        <p className="mt-1 text-sm opacity-90">{audience.audienceSize === 1 ? "customer matches" : "customers match"}</p>
                      </div>
                      <div className="rounded-[1.75rem] bg-surface p-6">
                        <p className="text-sm text-muted">Average spend {inr(audience.averageSpend)}</p>
                        {readable.length ? (
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {readable.map((part) => (
                              <li key={part} className="rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
                                {part}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-muted">No filters recognised, so this is every customer. Mention spend, city, age, channel or days since the last order to narrow it.</p>
                        )}
                        {audience.sampleCustomers.length ? (
                          <p className="mt-4 text-sm text-muted">
                            Including {audience.sampleCustomers.slice(0, 3).map((customer) => customer.name).join(", ")}
                            {audience.audienceSize > 3 ? " and others" : ""}.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </StepLayout>
              ) : null}

              {step === 1 ? (
                <StepLayout
                  headingRef={heading}
                  title="What should it say?"
                  lead="A first draft is ready. Change anything you like."
                  aside={preview}
                  action={
                    <Button variant="secondary" size="sm" onClick={writeDraft} disabled={busy !== null}>
                      {busy === "draft" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Sparkles className="h-3.5 w-3.5" aria-hidden />}
                      {copy.messageBody ? "Rewrite" : "Write it for me"}
                    </Button>
                  }
                >
                  <Group>
                    <Field label="Campaign name" hint="Only your team sees this.">
                      <Input value={copy.title} onChange={(event) => setCopy({ ...copy, title: event.target.value })} placeholder="Diwali win-back" />
                    </Field>
                    {channel === "EMAIL" ? (
                      <Field label="Subject line">
                        <Input value={copy.subjectLine} onChange={(event) => setCopy({ ...copy, subjectLine: event.target.value })} />
                      </Field>
                    ) : null}
                    <Field label="Message" hint="Write {{name}} where the customer’s name should go.">
                      <Textarea value={copy.messageBody} onChange={(event) => setCopy({ ...copy, messageBody: event.target.value })} placeholder="Hi {{name}}, …" />
                    </Field>
                    <Field label="Button text">
                      <Input value={copy.cta} onChange={(event) => setCopy({ ...copy, cta: event.target.value })} placeholder="Shop now" />
                    </Field>
                  </Group>
                </StepLayout>
              ) : null}

              {step === 2 ? (
                <StepLayout headingRef={heading} title="Where should it go?" lead="We picked the channel this audience is most likely to read." aside={preview}>
                  <fieldset>
                    <legend className="sr-only">Channel</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {channels.map((option) => {
                        const Icon = channelIcons[option];
                        const recommended = recommendation?.channel === option;
                        return (
                          <label
                            key={option}
                            className={cn(
                              "flex cursor-pointer flex-col rounded-[1.5rem] bg-surface p-5 ring-1 transition-[box-shadow] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent",
                              channel === option ? "ring-2 ring-accent" : "ring-rule hover:ring-ink/30"
                            )}
                          >
                            <input type="radio" name="channel" value={option} checked={channel === option} onChange={() => setChannel(option)} className="sr-only" />
                            <span className="flex items-center justify-between">
                              <Icon className={cn("h-6 w-6", channel === option ? "text-accent" : "text-muted")} aria-hidden />
                              {recommended ? <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">Recommended</span> : null}
                            </span>
                            <span className="mt-6 text-lg font-bold">{channelNames[option]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  {recommendation ? (
                    <p className="mt-4 max-w-prose text-sm text-muted">
                      Why {channelNames[recommendation.channel]}: {recommendation.reasoning}
                    </p>
                  ) : null}
                </StepLayout>
              ) : null}

              {step === 3 ? (
                <StepLayout headingRef={heading} title="Ready to send?" lead="Check the details, then press and hold to send." aside={preview}>
                  <dl className="divide-y overflow-hidden rounded-[1.75rem] bg-surface">
                    <Row label="Audience">“{prompt}”</Row>
                    <Row label="Recipients">
                      {count(recipients)} customers
                      {audience && audience.audienceSize > SEND_LIMIT ? <span className="block text-sm text-muted">The top {count(SEND_LIMIT)} of {count(audience.audienceSize)} by spend</span> : null}
                    </Row>
                    <Row label="Channel">{channelNames[channel]}</Row>
                    <Row label="Campaign">{copy.title}</Row>
                  </dl>
                  <div className="mt-8 flex flex-col items-start gap-3">
                    <HoldButton onHoldComplete={send} disabled={busy !== null && busy !== "send"} busy={busy === "send"} completeLabel="Sending" className="h-14 min-w-72 text-lg">
                      Hold to send
                    </HoldButton>
                    <p className="text-sm text-muted">Messages go out straight away and can’t be recalled.</p>
                  </div>
                </StepLayout>
              ) : null}
            </motion.div>
          </AnimatePresence>

          {error ? (
            <p role="alert" className="mt-6 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </main>

        {step < steps.length - 1 ? (
          <footer className="fixed inset-x-0 bottom-0 z-10 bg-bg/90 backdrop-blur-xl pb-safe">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 border-t px-4 pt-4 sm:px-6">
              <Button variant="quiet" onClick={() => setStep(step - 1)} disabled={step === 0} className={step === 0 ? "invisible" : ""}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </Button>
              <div className="flex items-center gap-3">
                {step === 0 && !audience ? <span className="hidden text-sm text-muted sm:inline">Find customers to continue</span> : null}
                {step === 1 && !messageReady ? <span className="hidden text-sm text-muted sm:inline">Add a name, message and button text</span> : null}
                <Button size="lg" onClick={() => setStep(step + 1)} disabled={!canContinue}>
                  Continue
                </Button>
              </div>
            </div>
          </footer>
        ) : (
          <footer className="fixed inset-x-0 bottom-0 z-10 bg-bg/90 backdrop-blur-xl pb-safe">
            <div className="mx-auto flex max-w-6xl items-center border-t px-4 pt-4 sm:px-6">
              <Button variant="quiet" onClick={() => setStep(step - 1)} disabled={busy === "send"}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back
              </Button>
            </div>
          </footer>
        )}
      </div>
    </MotionConfig>
  );
}

function StepLayout({
  headingRef,
  title,
  lead,
  aside,
  action,
  children
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  title: string;
  lead: string;
  aside?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("grid gap-10", aside ? "lg:grid-cols-[minmax(0,1fr)_24rem]" : "")}>
      <div className="min-w-0">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 ref={headingRef} tabIndex={-1} className="text-3xl font-bold tracking-tight focus-visible:outline-none sm:text-5xl">
              {title}
            </h2>
            <p className="mt-3 text-lg text-muted">{lead}</p>
          </div>
          {action}
        </div>
        {children}
      </div>
      {aside ? <aside className="lg:sticky lg:top-28 lg:self-start">{aside}</aside> : null}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
