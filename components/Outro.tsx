"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { CREDITS } from "@/lib/data";
import type { RevealRef } from "@/hooks/useReveal";

export function Outro({ revealRef }: { revealRef: RevealRef }) {
  const credits = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = credits.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={revealRef}
      className="relative aspect-[1/1.75] min-h-140 overflow-hidden bg-[#221D1C]"
    >
      <img
        decoding="async"
        src="/images/outro.webp"
        alt=""
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,12,11,.72)_0%,rgba(15,12,11,.6)_45%,rgba(15,12,11,.88)_100%)]" />

      {/* 관찰 대상은 움직이는 크레딧이 아니라 고정된 이 컨테이너다. 크레딧이 길면 시작 위치에서
          보이는 비율이 threshold 를 못 넘어 애니메이션이 영영 시작되지 않는다. */}
      <div
        ref={credits}
        className="pointer-events-none absolute inset-x-0 top-0 bottom-42.5
        flex items-start overflow-hidden px-7 pt-6"
      >
        <div
          style={{
            transform: "translateY(105%)",
            animation: run ? "wcredit 15s linear forwards" : "none",
          }}
          className="w-full text-left"
        >
          <div className="text-center font-heading text-[9.5px] tracking-[.35em] uppercase text-[rgba(255,247,243,.55)]">
            The Wedding of
          </div>
          <div className="mt-1 text-center font-script text-[38px] leading-none text-[rgba(255,247,243,.92)]">
            Kyoungsic &amp; Sumin
          </div>
          <div className="mt-8 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3.5">
            {CREDITS.map((c) => (
              <Fragment key={c.k}>
                <span className="pt-0.75 font-heading text-[9px] tracking-[.2em] uppercase text-[rgba(255,247,243,.5)]">
                  {c.k}
                </span>
                <span className="text-[12.5px] leading-[1.6] text-[rgba(255,247,243,.88)]">
                  {c.v}
                </span>
              </Fragment>
            ))}
          </div>
          <div className="mt-8 text-center font-script text-[26px] text-[rgba(255,247,243,.7)]">
            To be continued…
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-9 px-8 text-center">
        <p className="m-0 text-[11.5px] leading-[1.9] text-[rgba(255,247,243,.62)]">
          오랜 시간 준비한 저희의 이야기가
          <br />
          마침내 시작됩니다.
          <br />그 특별한 순간을 함께 지켜봐 주세요.
        </p>
        <div className="mt-4.5 font-script text-[34px] text-[#FF9A42]">
          Thank you!
        </div>
      </div>
    </section>
  );
}
