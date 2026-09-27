"use client";
import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { GALLERY } from "@/lib/data";
import { useSwipeStack } from "@/hooks/useSwipeStack";
import { p2 } from "@/lib/wedding";
import type { RevealRef } from "@/hooks/useReveal";

const ARROW = "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer appearance-none " +
  "items-center justify-center rounded-[99px] bg-white/15 backdrop-blur-[6px] text-[#FFF7F3] hover:bg-white/25";

export function Gallery({ revealRef }: { revealRef: RevealRef }) {
  const [box, setBox] = useState<number | null>(null);
  const { wrapRef, cardRefs, bringToFront } = useSwipeStack(GALLERY.length, setBox);

  const close = () => { if (box !== null) bringToFront(box); setBox(null); };
  const step = (delta: number) =>
    setBox((b) => (b === null ? b : (b + delta + GALLERY.length) % GALLERY.length));

  // 라이트박스는 배경 클릭으로만 닫혔다. 키보드 사용자에게는 탈출 경로가 없다.
  useEffect(() => {
    if (box === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [box]);

  return (
    <>
      <section ref={revealRef} className="pt-[22px] pb-14">
        <SectionHeading title="WEDDING GALLERY" />
        <div ref={wrapRef} className="relative mx-auto aspect-736/1000 w-[76%] max-w-[320px]">
          {GALLERY.map((g, i) => (
            <div
              key={g.src}
              ref={(el) => { cardRefs.current[i] = el; }}
              className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-md
                bg-[#F1EAE6] select-none will-change-transform"
            >
              <img src={g.src} alt={g.alt} draggable={false} loading="lazy" decoding="async"
                className="pointer-events-none block h-full w-full select-none object-cover" />
            </div>
          ))}
        </div>
        <div className="mt-[26px] flex items-center justify-center gap-[9px] font-heading
          text-[9.5px] font-medium tracking-[.2em] uppercase text-[#B4A9A3]">
          <span>←</span><span>swipe</span><span>→</span>
        </div>
      </section>

      {box !== null && (
        <div onClick={close}
          className="fixed inset-0 z-60 flex animate-[wfade_.25s_ease_both] cursor-zoom-out
            items-center justify-center bg-[rgba(30,25,24,.9)] p-6">
          <img src={GALLERY[box].src} alt={GALLERY[box].alt} decoding="async"
            className="max-h-[86vh] w-full max-w-[380px] select-none rounded-lg object-contain" />
          <button aria-label="이전 사진" onClick={(e) => { e.stopPropagation(); step(-1); }}
            className={`${ARROW} left-2.5`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF7F3"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="14 5 7 12 14 19" />
            </svg>
          </button>
          <button aria-label="다음 사진" onClick={(e) => { e.stopPropagation(); step(1); }}
            className={`${ARROW} right-2.5`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFF7F3"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="10 5 17 12 10 19" />
            </svg>
          </button>
          <div className="absolute inset-x-0 bottom-[26px] text-center font-heading text-[11.5px]
            tracking-[.1em] text-[rgba(255,247,243,.72)]">
            {p2(box + 1)} / {GALLERY.length}
          </div>
        </div>
      )}
    </>
  );
}
