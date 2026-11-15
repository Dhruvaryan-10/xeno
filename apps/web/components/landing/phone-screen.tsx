"use client";

import { useEffect, useState } from "react";
import { Check, ChevronLeft, Phone, Video } from "lucide-react";

// What a customer sees: a store's WhatsApp-style message arriving. Used on the 3D phone and its flat fallback.
const STEPS_MS = [900, 2200, 3200];

export function PhoneScreen({ animate = true }: { animate?: boolean }) {
  const [step, setStep] = useState(animate ? 0 : 3);

  useEffect(() => {
    if (!animate) return;
    const timers = STEPS_MS.map((ms, index) => setTimeout(() => setStep(index + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [animate]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[2.4rem] bg-[#F4F1F8] font-sans text-[#1D1842]">
      <div className="flex items-center justify-between px-7 pb-1 pt-4 text-[13px] font-semibold">
        <span>9:41</span>
        <span className="h-3 w-6 rounded-[3px] border border-[#1D1842]/60 p-px">
          <span className="block h-full w-3/4 rounded-[1px] bg-[#1D1842]" />
        </span>
      </div>
      <div className="flex items-center gap-2 border-b border-[#1D1842]/10 bg-white/80 px-3 py-2.5">
        <ChevronLeft className="h-5 w-5 text-[#D7261E]" aria-hidden />
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1D1842] text-[13px] font-bold text-[#FDA1A2]">G</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-tight">Glow Store</span>
          <span className="block text-[11px] text-[#5E5A78]">Business account</span>
        </span>
        <Video className="h-5 w-5 text-[#D7261E]" aria-hidden />
        <Phone className="h-[18px] w-[18px] text-[#D7261E]" aria-hidden />
      </div>

      <div className="flex flex-1 flex-col justify-end gap-2 px-3 pb-6">
        <p className="mx-auto mb-auto mt-4 rounded-full bg-white/70 px-3 py-1 text-[11px] text-[#5E5A78]">Today</p>

        {step === 1 ? (
          <span className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-bl-md bg-white px-3 py-3 shadow-sm">
            {[0, 150, 300].map((delay) => (
              <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#5E5A78]/60" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </span>
        ) : null}

        {step >= 2 ? (
          <div className="max-w-[86%] animate-[rise_0.45s_cubic-bezier(0.23,1,0.32,1)]">
            <div className="rounded-2xl rounded-bl-md bg-white px-3.5 pb-2 pt-3 text-[14px] leading-snug shadow-sm">
              <p className="font-semibold text-[#8E0D3C]">Hi Aarav, it’s been a while</p>
              <p className="mt-1">Your favourites are back in stock, and delivery is free this week. Take a look before they go.</p>
              <span className="mt-1 flex items-center justify-end gap-1 text-[10px] text-[#5E5A78]">
                10:24 <Check className="h-3 w-3" aria-hidden />
              </span>
            </div>
            <div className="mt-1 rounded-2xl bg-white py-2.5 text-center text-[14px] font-semibold text-[#D7261E] shadow-sm">See what’s new</div>
          </div>
        ) : null}

        {step >= 3 ? (
          <div className="ml-auto max-w-[70%] animate-[rise_0.45s_cubic-bezier(0.23,1,0.32,1)] rounded-2xl rounded-br-md bg-[#1D1842] px-3.5 py-2.5 text-[14px] text-white shadow-sm">
            Ordered two, thank you!
          </div>
        ) : null}
      </div>
    </div>
  );
}
