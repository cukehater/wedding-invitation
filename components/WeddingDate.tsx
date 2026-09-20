"use client";
import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { calendarRows, countdownUnits } from "@/lib/wedding";

const CELL =
  "flex h-[26px] w-[26px] items-center justify-center font-serif-display text-[15px] text-[#3A3330]";

const PLACEHOLDER = [
  { value: "--", label: "DAYS", hasSep: true },
  { value: "--", label: "HOUR", hasSep: true },
  { value: "--", label: "MIN", hasSep: true },
  { value: "--", label: "SEC", hasSep: false },
];

export function WeddingDate({
  revealRef,
}: {
  revealRef: (n: HTMLElement | null) => void;
}) {
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
      className="relative px-6 pt-[34px] pb-16 text-center"
    >
      <SectionHeading title="WEDDING DATE" />

      <div className="relative mx-auto mt-11 w-[74%] rotate-[-2.5deg]">
        <img
          src="/images/tape-yellow.webp"
          alt=""
          className="pointer-events-none absolute -top-[58px] left-[46%] z-2 -ml-[56px] w-[112px]
            rotate-6 select-none [filter:drop-shadow(0_2px_3px_rgba(60,50,40,.16))]"
        />
        <div className="bg-white px-3 pt-3 pb-5 shadow-[0_6px_18px_rgba(60,50,40,.14)]">
          <img
            src="/images/date-photo.webp"
            alt="date photo"
            className="block aspect-square w-full select-none bg-[#EDEAE7] object-cover"
          />
          <div className="mt-2.5 font-tangerine text-[30px] font-bold text-[#3A3330]">
            see you there :)
          </div>
        </div>
        <img
          src="/images/sticker-clip.webp"
          alt=""
          className="pointer-events-none absolute -right-4 -bottom-[14px] w-12 rotate-14 select-none"
        />
      </div>

      <div className="mt-[38px] font-serif-display text-[28px] leading-none tracking-[.04em] text-[#2E2A27]">
        2026. 11
      </div>

      <div className="mx-auto mt-[22px] grid w-max gap-[3px]">
        {calendarRows().map((row, ri) => (
          <div key={ri} className="flex justify-start gap-[2px]">
            {row.map((cell, ci) =>
              cell.isTarget ? (
                <span
                  key={ci}
                  className="relative flex h-[26px] w-[26px] items-center justify-center
                  font-serif-display text-[16px] font-semibold text-[#C6362F]
                  animate-[wday_1.8s_ease-in-out_infinite]"
                >
                  <img
                    src="/images/arrow-mark.webp"
                    alt=""
                    className="pointer-events-none absolute top-[35%] right-full w-[33px] select-none
                      animate-[warrow_1.8s_ease-in-out_infinite]"
                  />
                  29
                  <span
                    className="absolute top-[31px] left-1/2 -translate-x-1/2 whitespace-nowrap
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

      <div className="mt-[50px] font-heading text-[14px] font-medium leading-[1.2] tracking-[.04em] text-[#2E2A27]">
        SUNDAY 4:20 PM
      </div>

      <div className="mt-5 flex origin-top scale-[.8] items-center justify-center">
        {units.map((u) => (
          <div key={u.label} className="flex items-center">
            <div className="grid w-[62px] justify-items-center gap-2 rounded-xl bg-[#EFEDEA] pt-4 pb-[18px]">
              <span className="font-heading text-[10.5px] font-semibold tracking-[.08em] text-[#5E5852]">
                {u.label}
              </span>
              <span className="font-heading text-[22px] font-semibold leading-none text-[#2E2A27]">
                {u.value}
              </span>
            </div>
            {u.hasSep && (
              <span className="w-[26px] text-center font-serif-display text-[14px] text-[#9A938D]">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
