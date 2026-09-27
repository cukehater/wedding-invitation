"use client";
import { useEffect, useRef, useState } from "react";
import { CREDITS } from "@/lib/data";
import type { RevealRef } from "@/hooks/useReveal";

export function Outro({ revealRef }: { revealRef: RevealRef }) {
  const credits = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = credits.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setRun(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={revealRef} className="relative h-[calc(100dvh/var(--card-zoom))] overflow-hidden bg-[#221D1C]">
      <img loading="lazy" decoding="async" src="/images/outro.webp" alt=""
        className="absolute inset-0 h-full w-full select-none object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,11,.72)_0%,rgba(15,12,11,.6)_45%,rgba(15,12,11,.88)_100%)]" />

      <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[170px]
        flex items-start overflow-hidden px-7 pt-6">
        <div ref={credits}
          style={{ transform: "translateY(105%)", animation: run ? "wcredit 12s linear forwards" : "none" }}
          className="grid gap-3 text-[11.5px] leading-[1.6]">
          {CREDITS.map((c) => (
            <div key={c.k} className="flex gap-[14px]">
              <span className="min-w-[108px] text-[rgba(255,247,243,.82)]">{c.k}</span>
              <span className="text-[rgba(255,247,243,.55)]">{c.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-9 px-8 text-center">
        <p className="m-0 text-[11.5px] leading-[1.9] text-[rgba(255,247,243,.62)]">
          오랜 시간 준비한 저희의 이야기가<br />마침내 시작됩니다.<br />
          그 특별한 순간을 함께 지켜봐 주세요.
        </p>
        <div className="mt-[18px] font-script text-[34px] text-[#FF9A42]">Thank you!</div>
      </div>
    </section>
  );
}
