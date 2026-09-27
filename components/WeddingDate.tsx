"use client";
import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { Sticker } from "./Sticker";
import { calendarRows, countdownUnits } from "@/lib/wedding";
import type { RevealRef } from "@/hooks/useReveal";

const CELL =
  "flex h-6.5 w-6.5 items-center justify-center font-serif-display text-[15px] text-[#3A3330]";

const PLACEHOLDER = [
  { value: "--", label: "DAYS", hasSep: true },
  { value: "--", label: "HOUR", hasSep: true },
  { value: "--", label: "MIN", hasSep: true },
  { value: "--", label: "SEC", hasSep: false },
];

export function WeddingDate({ revealRef }: { revealRef: RevealRef }) {
  // 서버와 클라이언트의 Date.now() 가 달라 hydration 이 깨지므로 첫 렌더는 placeholder.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = now === null ? PLACEHOLDER : countdownUnits(now);

  return (
    <section
      ref={revealRef}
      className="relative px-6 pt-8.5 pb-16 text-center"
    >
      <SectionHeading title="WEDDING DATE" />

      <div className="relative mx-auto mt-11 w-[74%] rotate-[-2.5deg]">
        <img loading="lazy" decoding="async"
          src="/images/tape-yellow.webp"
          alt=""
          className="pointer-events-none absolute -top-14.5 left-[46%] z-2 -ml-14 w-28
            rotate-6 select-none [filter:drop-shadow(0_2px_3px_rgba(60,50,40,.16))]"
        />
        <div className="bg-white px-3 pt-3 pb-5 shadow-[0_6px_18px_rgba(60,50,40,.14)]">
          <img loading="lazy" decoding="async"
            src="/images/date-photo.webp"
            alt="date photo"
            className="block aspect-square w-full select-none bg-[#EDEAE7] object-cover"
          />
          <div className="mt-2.5 font-tangerine text-[30px] font-bold text-[#3A3330]">
            see you there :)
          </div>
        </div>
        <Sticker src="sticker-clip.webp" tilt="14deg" dur="2.5s" delay="-0.35s"
          className="-right-4 -bottom-3.5 w-12"
        />
      </div>

      <div className="mt-9.5 font-serif-display text-[28px] leading-none tracking-[.04em] text-[#2E2A27]">
        2026. 11
      </div>

      <div className="mx-auto mt-5.5 grid w-max gap-0.75">
        {calendarRows().map((row, ri) => (
          <div key={ri} className="flex justify-start gap-0.5">
            {row.map((cell, ci) =>
              cell.isTarget ? (
                <span
                  key={ci}
                  className="relative flex h-6.5 w-6.5 items-center justify-center
                  font-serif-display text-[16px] font-semibold text-[#C6362F]
                  animate-[wday_1.8s_ease-in-out_infinite]"
                >
                  <img loading="lazy" decoding="async"
                    src="/images/arrow-mark.webp"
                    alt=""
                    // 로드 전에도 박스를 예약한다. 높이가 0 이면 warrow 의 translateY(-50%) 도 0 이라
                    // 이미지가 도착하는 순간(모바일에서는 스크롤 도중) 화살표가 16px 튄다.
                    width={428}
                    height={523}
                    className="pointer-events-none absolute top-[35%] right-full w-8.25 select-none
                      animate-[warrow_1.8s_ease-in-out_infinite]"
                  />
                  29
                  <span
                    className="absolute top-7.75 left-1/2 -translate-x-1/2 whitespace-nowrap
                    font-alexbrush text-[22px] leading-none text-[#D2453F]"
                  >
                    this day!
                  </span>
                </span>
              ) : (
                <span key={ci} className={CELL}>
                  {cell.label}
                </span>
              ),
            )}
          </div>
        ))}
      </div>

      <div className="mt-12.5 font-heading text-[14px] font-medium leading-[1.2] tracking-[.04em] text-[#2E2A27]">
        SUNDAY 4:20 PM
      </div>

      <div className="mt-5 flex origin-top scale-[.8] items-center justify-center">
        {units.map((u) => (
          <div key={u.label} className="flex items-center">
            <div className="grid w-15.5 justify-items-center gap-2 rounded-xl bg-[#EFEDEA] pt-4 pb-4.5">
              <span className="font-heading text-[10.5px] font-semibold tracking-[.08em] text-[#5E5852]">
                {u.label}
              </span>
              <span className="font-heading text-[22px] font-semibold leading-none text-[#2E2A27]">
                {u.value}
              </span>
            </div>
            {u.hasSep && (
              <span className="w-6.5 text-center font-serif-display text-[14px] text-[#9A938D]">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
