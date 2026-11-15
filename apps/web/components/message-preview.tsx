import type { AudiencePreview, CampaignCopy, Channel } from "@/lib/api";
import { channelNames, count, inr, personalize } from "@/lib/campaign";

const SMS_SEGMENT = 160;
const bubble = "bg-surface shadow-[0_1px_1px_rgb(10_24_40/0.08)]";

export function MessagePreview({
  channel,
  copy,
  audience,
  recipients
}: {
  channel: Channel;
  copy: CampaignCopy;
  audience: AudiencePreview | null;
  recipients: number;
}) {
  const sample = audience?.sampleCustomers[0];
  const name = sample?.name.split(" ")[0] ?? "Priya";
  const body = personalize(copy.messageBody, name) || "Your message appears here as you write it.";
  const cta = copy.cta || "Button text";
  const smsLength = `${body} ${cta}`.length;

  return (
    <section aria-labelledby="preview-title" className="rounded-cell bg-surface p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="preview-title" className="text-base font-semibold">
          Preview
        </h2>
        <span className="truncate text-xs text-muted">
          {channelNames[channel]} to {sample ? sample.name : "a sample customer"}
        </span>
      </div>

      {/* The conversation canvas, roughly how the customer's phone shows it. */}
      <div className="mt-3 min-h-44 rounded-[1.25rem] bg-bg p-4">
        {channel === "EMAIL" ? (
          <div className={`rounded-xl p-4 ${bubble}`}>
            <p className="text-xs text-muted">Subject</p>
            <p className="font-semibold">{personalize(copy.subjectLine, name) || "Subject line"}</p>
            <hr className="my-3" />
            <p className="whitespace-pre-line text-sm leading-relaxed">{body}</p>
            <span className="mt-4 inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-ink">{cta}</span>
          </div>
        ) : channel === "RCS" ? (
          <div className={`max-w-[17rem] overflow-hidden rounded-2xl ${bubble}`}>
            <div className="p-3">
              <p className="text-sm font-semibold">{copy.title || "Campaign name"}</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{body}</p>
            </div>
            <p className="border-t py-2.5 text-center text-sm font-semibold text-accent">{cta}</p>
          </div>
        ) : (
          <div className="max-w-[17rem]">
            <div className={`rounded-2xl rounded-bl-md px-3.5 py-2.5 ${bubble}`}>
              <p className="whitespace-pre-line text-sm leading-relaxed">{body}</p>
              {channel === "SMS" ? <p className="mt-2 text-sm text-accent underline">{cta}</p> : null}
            </div>
            {channel === "WHATSAPP" ? <p className={`mt-1 rounded-2xl py-2.5 text-center text-sm font-semibold text-accent ${bubble}`}>{cta}</p> : null}
          </div>
        )}
      </div>
      {channel === "SMS" ? (
        <p className="mt-2 text-xs text-muted tabular-nums">
          {smsLength} characters, {Math.max(1, Math.ceil(smsLength / SMS_SEGMENT))} SMS per customer
        </p>
      ) : null}

      {audience ? (
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <dt className="text-xs text-muted">Recipients</dt>
            <dd className="text-lg font-semibold">{count(recipients)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Average spend</dt>
            <dd className="text-lg font-semibold">{inr(audience.averageSpend)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-muted">Revenue if 8% of the audience buys again</dt>
            <dd className="text-lg font-semibold">{inr(audience.estimatedRevenue)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-5 border-t pt-4 text-sm text-muted">Find customers to see who this goes to and what it could bring in.</p>
      )}
    </section>
  );
}
