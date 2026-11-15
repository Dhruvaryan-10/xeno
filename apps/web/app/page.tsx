import Link from "next/link";
import { ArrowDown, Mail, MessageCircle, MessageSquareText, Smartphone, Sparkles } from "lucide-react";
import { ActivityRings } from "@/components/activity-rings";
import { BrandMark } from "@/components/brand-mark";
import { HoldButton } from "@/components/hold-button";
import { Reveal } from "@/components/reveal";
import { HeroPhone } from "@/components/landing/hero-phone";

const steps = [
  { title: "Describe who", body: "Write the audience the way you’d say it to a colleague. It’s turned into filters you can read." },
  { title: "Shape the message", body: "A first draft is written for that audience. Edit every word and see it as the customer will." },
  { title: "Send and learn", body: "Hold to send on the recommended channel, then watch delivered, opened and bought fill in." }
];

const channels = [
  { icon: MessageCircle, name: "WhatsApp" },
  { icon: MessageSquareText, name: "SMS" },
  { icon: Mail, name: "Email" },
  { icon: Smartphone, name: "RCS" }
];

const tile = "rounded-[2rem] bg-surface p-6 sm:p-8";

export default function Landing() {
  return (
    <div className="bg-bg">
      <header className="fixed inset-x-0 top-0 z-30 bg-[#1D1842]/70 pt-[env(safe-area-inset-top)] text-white backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <BrandMark />
            Campaign Copilot
          </Link>
          <nav aria-label="Page" className="hidden items-center gap-8 text-sm text-white/75 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <a href="#install" className="hover:text-white">
              Install
            </a>
          </nav>
          <Link href="/app" className="inline-flex h-10 items-center rounded-full bg-[#FF6B5E] px-5 text-sm font-semibold text-[#1D1842] hover:bg-[#ff8378]">
            Open the app
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#1D1842] text-white">
          <div className="mx-auto grid min-h-[100svh] max-w-[90rem] items-center gap-6 px-4 pb-10 pt-24 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:px-10 lg:pt-16">
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1.5 text-sm text-[#FDA1A2] ring-1 ring-white/10">
                <Sparkles className="h-4 w-4" aria-hidden />
                AI campaigns for online stores
              </p>
              <h1 className="mt-6 text-[3rem] font-bold leading-[0.98] tracking-[-0.045em] sm:text-7xl xl:text-[5.75rem]">
                Say who.
                <br />
                We’ll reach them.
              </h1>
              <p className="mt-7 max-w-[32rem] text-lg leading-relaxed text-[#C9C4E0]">
                Describe the customers you want back in plain words. Copilot finds them, writes the message, sends it where they read, and shows you who bought.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/app" className="inline-flex h-12 items-center rounded-full bg-[#FF6B5E] px-7 text-base font-semibold text-[#1D1842] transition-transform hover:bg-[#ff8378] active:scale-[0.97]">
                  Start a campaign
                </Link>
                <a href="#features" className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-base font-semibold text-white ring-1 ring-white/20 hover:bg-white/[0.06]">
                  See the features
                  <ArrowDown className="h-4 w-4" aria-hidden />
                </a>
              </div>
              <ul className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#C9C4E0]" aria-label="Channels">
                {channels.map((channel) => (
                  <li key={channel.name} className="flex items-center gap-2">
                    <channel.icon className="h-4 w-4 text-[#FDA1A2]" aria-hidden />
                    {channel.name}
                  </li>
                ))}
              </ul>
            </div>
            <HeroPhone />
          </div>
        </section>

        {/* Features as live pieces of the product */}
        <section id="features" className="mx-auto max-w-[90rem] scroll-mt-20 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <Reveal><h2 className="max-w-[18ch] text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl">One sentence in. A campaign out.</h2></Reveal>
          <div className="mt-12 grid gap-4 lg:grid-cols-6">
            <Reveal as="article" className={`${tile} lg:col-span-4`}>
              <h3 className="text-sm font-semibold text-accent">Audience from a sentence</h3>
              <p className="mt-4 text-2xl font-semibold leading-snug tracking-tight sm:text-4xl">“Customers in Mumbai who spent over ₹20,000 and haven’t ordered in 60 days”</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {["Lives in Mumbai", "Spent over ₹20,000", "No purchase in 60+ days"].map((chip) => (
                  <li key={chip} className="rounded-full bg-accent/10 px-3.5 py-1.5 text-sm font-medium text-accent">
                    {chip}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-muted">Read back to you as plain filters, so you always know exactly who you’re messaging.</p>
            </Reveal>

            <Reveal as="article" delay={0.08} className={`${tile} flex flex-col lg:col-span-2`}>
              <h3 className="text-sm font-semibold text-accent">Hold to send</h3>
              <p className="mt-4 text-muted">No accidental sends. Press and hold to confirm. Try it.</p>
              <div className="mt-auto pt-8">
                <HoldButton completeLabel="Sent" resetAfter={1800} className="w-full">
                  Hold to send
                </HoldButton>
              </div>
            </Reveal>

            <Reveal as="article" delay={0.16} className={`${tile} lg:col-span-3`}>
              <h3 className="text-sm font-semibold text-accent">Results that fill in live</h3>
              <div className="mt-8">
                <ActivityRings
                  size={200}
                  total={480}
                  rings={[
                    { label: "Delivered", value: 451, color: "rgb(var(--ring-1))" },
                    { label: "Opened", value: 341, color: "rgb(var(--ring-2))" },
                    { label: "Bought", value: 77, color: "rgb(var(--ring-3))" }
                  ]}
                />
              </div>
              <p className="mt-6 text-xs text-muted">Example from a simulated campaign to 480 customers.</p>
            </Reveal>

            <Reveal as="article" delay={0.24} className="rounded-[2rem] bg-[#1D1842] p-6 text-white sm:p-8 lg:col-span-3 dark:bg-surface">
              <h3 className="text-sm font-semibold text-[#FDA1A2]">Written for you, edited by you</h3>
              <div className="mt-6 max-w-sm rounded-2xl rounded-bl-md bg-white/[0.08] p-4 leading-relaxed ring-1 ring-white/10">
                Hi <span className="rounded bg-[#FF6B5E]/20 px-1 text-[#FDA1A2]">Aarav</span>, it’s been a while. Your favourites are back in stock, and delivery is free this week.
              </div>
              <p className="mt-6 text-[#C9C4E0]">Each customer’s name is filled in for them. The channel is recommended, with the reason shown, and you can switch it in one tap.</p>
            </Reveal>
          </div>
        </section>

        {/* How it works: a real sequence */}
        <section id="how" className="scroll-mt-20 bg-surface">
          <div className="mx-auto max-w-[90rem] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
            <Reveal><h2 className="max-w-[16ch] text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl">Three steps. A few minutes.</h2></Reveal>
            <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
              {steps.map((step, index) => (
                <Reveal as="li" key={step.title} delay={index * 0.12} className="relative">
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-lg font-bold text-accent-ink">{index + 1}</span>
                    {index < steps.length - 1 ? <span className="hidden h-px flex-1 bg-rule md:block" aria-hidden /> : null}
                  </div>
                  <h3 className="mt-6 text-2xl font-bold tracking-tight">{step.title}</h3>
                  <p className="mt-2 max-w-sm leading-relaxed text-muted">{step.body}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Install */}
        <section id="install" className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-10">
          <div className="relative mx-auto max-w-[90rem] overflow-hidden rounded-[2.5rem] bg-[#1D1842] px-6 py-14 text-white sm:px-12 lg:py-20">
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#EF3B33]/30 blur-[100px]" aria-hidden />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-end">
              <div>
                <Reveal><h2 className="max-w-[14ch] text-4xl font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl">Put it on your Home Screen.</h2></Reveal>
                <p className="mt-5 max-w-[30rem] text-lg leading-relaxed text-[#C9C4E0]">Install Copilot like an app. It opens full screen with its own icon.</p>
                <Link href="/app" className="mt-8 inline-flex h-12 items-center rounded-full bg-[#FF6B5E] px-7 text-base font-semibold text-[#1D1842] hover:bg-[#ff8378]">
                  Open the app
                </Link>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/[0.07] p-6 ring-1 ring-white/10">
                  <dt className="font-semibold">iPhone and iPad</dt>
                  <dd className="mt-2 text-[#C9C4E0]">In Safari, tap Share, then Add to Home Screen.</dd>
                </div>
                <div className="rounded-[1.5rem] bg-white/[0.07] p-6 ring-1 ring-white/10">
                  <dt className="font-semibold">Android</dt>
                  <dd className="mt-2 text-[#C9C4E0]">In Chrome, tap the menu, then Install app.</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-4 px-4 pb-10 text-sm text-muted sm:px-6 lg:px-10">
        <span className="flex items-center gap-2">
          <BrandMark className="h-5 w-5" />
          Campaign Copilot
        </span>
        <span>Next.js, Express and Gemini. Demo data, simulated delivery.</span>
      </footer>
    </div>
  );
}
