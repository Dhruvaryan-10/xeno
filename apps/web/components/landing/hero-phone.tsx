"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { PhoneScreen } from "./phone-screen";

// three.js only runs in the browser, so the scene is loaded client-side.
const PhoneScene = dynamic(() => import("./phone-scene"), { ssr: false, loading: () => <FlatPhone animate={false} /> });

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Flat phone for the first paint and for browsers without WebGL. */
function FlatPhone({ animate }: { animate: boolean }) {
  return (
    <div className="mx-auto h-[33rem] w-[16rem] rounded-[2.9rem] bg-[#2A2160] p-2.5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)] ring-1 ring-white/10">
      <PhoneScreen animate={animate} />
    </div>
  );
}

export function HeroPhone() {
  const reduceMotion = useReducedMotion() ?? false;
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  // 0 while the phone is fully in view, 1 once it has scrolled off the top.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 140]);
  const opacity = useTransform(scrollYProgress, [0.4, 1], [1, 0]);

  useEffect(() => setWebgl(hasWebGL()), []);

  return (
    <motion.div ref={ref} style={{ y, opacity }} className="relative h-[34rem] w-full sm:h-[38rem] lg:h-[42rem]">
      {/* Soft coral glow behind the phone */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#EF3B33]/25 blur-[90px]" aria-hidden />
      <div className="pointer-events-none absolute left-[60%] top-[30%] h-64 w-64 rounded-full bg-[#E0457B]/25 blur-[80px]" aria-hidden />
      <p className="sr-only">A phone showing a store’s WhatsApp message arriving, with a button to see what’s new, and the customer replying that they ordered.</p>
      <div className="relative h-full w-full">
        {webgl === false ? (
          <div className="grid h-full place-items-center">
            <FlatPhone animate={!reduceMotion} />
          </div>
        ) : webgl ? (
          <PhoneScene still={reduceMotion} scroll={scrollYProgress} />
        ) : null}
      </div>
    </motion.div>
  );
}
