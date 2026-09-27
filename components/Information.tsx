"use client";
import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { INFO_TEXTS } from "@/lib/data";
import type { RevealRef } from "@/hooks/useReveal";

const MASK =
  "linear-gradient(to right,transparent 0,#000 16%,#000 74%,transparent 100%)";

export function Information({ revealRef }: { revealRef: RevealRef }) {
  const [i, setI] = useState(0);
  const step = (d: number) =>
    setI((v) => (v + d + INFO_TEXTS.length) % INFO_TEXTS.length);

  // i 가 바뀔 때마다 타이머를 다시 건다. 스와이프 직후 바로 자동 전환되는 걸 막는다.
  useEffect(() => {
    const id = setTimeout(() => step(1), 4200);
    return () => clearTimeout(id);
  }, [i]);

  // 전환은 좌우 스와이프만으로 한다. 탭은 아무것도 하지 않는다.
  // pointerId 를 같이 들고 있어야 취소된 드래그나 두 번째 손가락이 다음 pointerup 을
  // 엉뚱하게 한 칸 넘기지 않는다. useSwipeStack 과 같은 패턴.
  const drag = useRef<{ id: number; x: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    drag.current = { id: e.pointerId, x: e.clientX };
    // 포인터가 요소 밖으로 나가도 pointerup/cancel 을 받는다 (데스크톱 마우스 드래그).
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };
  const onCancel = () => {
    drag.current = null;
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) < 40) return;
    step(dx < 0 ? 1 : -1);
  };

  return (
    <section ref={revealRef} className="pt-11 pb-13">
      <SectionHeading title="INFOMATION" />
      <div
        onPointerDown={onDown}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        style={{ WebkitMaskImage: MASK, maskImage: MASK }}
        className="mx-auto aspect-1700/600 w-[85%] cursor-grab touch-pan-y overflow-hidden bg-[#F1EAE6]"
      >
        <img loading="lazy" decoding="async"
          src="/images/info.webp"
          alt=""
          className="h-full w-full select-none object-cover"
        />
      </div>
      <p className="mx-auto mt-7 max-w-72.5 text-center font-body text-[13.5px] leading-[1.6] text-[#6B6360] whitespace-pre-line">
        {INFO_TEXTS[i]}
      </p>
      <div className="mt-5 flex justify-center gap-1.5">
        {INFO_TEXTS.map((_, idx) => (
          <span
            key={idx}
            style={{ background: idx === i ? "#2E2A27" : "#DED8D6" }}
            className="h-1 w-1 rounded-[99px] transition-all duration-350"
          />
        ))}
      </div>
    </section>
  );
}
