"use client";
import { useCallback, useEffect, useRef } from "react";

const VIS = 4;
const SPRING = "transform .58s cubic-bezier(.22,1.12,.34,1), opacity .38s ease, box-shadow .4s ease";

export function useSwipeStack(count: number, onTap: (index: number) => void) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const orderRef = useRef<number[]>([]);
  const layoutRef = useRef<(animate: boolean) => void>(() => {});
  const onTapRef = useRef(onTap);
  onTapRef.current = onTap;

  useEffect(() => {
    const wrap = wrapRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!wrap || cards.length !== count) return;

    orderRef.current = cards.map((_, i) => i);

    // order 는 orderRef.current 하나만 본다. 지역 변수로 복사해두면 bringToFront 가
    // 바깥에서 바꾼 순서를 layout 이 못 보고 되돌려버린다.
    const layout = (animate: boolean) => {
      orderRef.current.forEach((ci, pos) => {
        const c = cards[ci];
        c.style.transition = animate ? SPRING : "none";
        c.style.zIndex = String(100 - pos);
        if (pos >= VIS) {
          c.style.opacity = "0";
          c.style.pointerEvents = "none";
          c.style.transform = `translate3d(0,${VIS * 11}px,0) scale(${1 - VIS * 0.045})`;
          return;
        }
        c.style.opacity = "1";
        c.style.pointerEvents = pos === 0 ? "auto" : "none";
        c.style.cursor = pos === 0 ? "grab" : "default";
        c.style.transform = `translate3d(0,${pos * 11}px,0) scale(${1 - pos * 0.045}) rotate(0deg)`;
        c.style.boxShadow = pos === 0
          ? "0 20px 44px rgba(60,45,40,.24), 0 2px 8px rgba(60,45,40,.12)"
          : "0 10px 26px rgba(60,45,40,.14)";
      });
    };
    layout(false);
    layoutRef.current = layout;

    let cycleTimer: ReturnType<typeof setTimeout>;
    let drag: {
      id: number; x: number; y: number; dx: number; dy: number;
      card: HTMLDivElement; t: number; axis: "x" | "y" | null;
    } | null = null;

    const down = (e: PointerEvent) => {
      const top = cards[orderRef.current[0]];
      if (!top || !top.contains(e.target as Node)) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, card: top, t: Date.now(), axis: null };
      top.style.transition = "none";
      top.style.cursor = "grabbing";
      try { top.setPointerCapture(e.pointerId); } catch {}
    };

    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.dx = e.clientX - drag.x;
      drag.dy = e.clientY - drag.y;
      if (!drag.axis && Math.abs(drag.dx) + Math.abs(drag.dy) > 8) {
        drag.axis = Math.abs(drag.dx) >= Math.abs(drag.dy) ? "x" : "y";
      }
      if (drag.axis === "y") return;
      if (e.cancelable) e.preventDefault();
      drag.card.style.transform =
        `translate3d(${drag.dx}px,${drag.dy * 0.32}px,0) rotate(${drag.dx * 0.055}deg)`;
      drag.card.style.opacity = String(Math.max(0.2, 1 - Math.min(1, Math.abs(drag.dx) / 220) * 0.8));
    };

    const up = () => {
      if (!drag) return;
      const d = drag;
      drag = null;
      d.card.style.cursor = "grab";
      const threshold = Math.max(56, wrap.clientWidth * 0.25);

      // 8px 미만 + 450ms 미만이면 드래그가 아니라 탭 → 라이트박스
      if (Math.abs(d.dx) + Math.abs(d.dy) < 8 && Date.now() - d.t < 450) {
        layout(true);
        onTapRef.current(cards.indexOf(d.card));
        return;
      }
      if (d.axis === "x" && Math.abs(d.dx) > threshold) {
        const dir = d.dx > 0 ? 1 : -1;
        d.card.style.transition = "transform .46s cubic-bezier(.32,.72,.36,1), opacity .42s ease";
        d.card.style.transform =
          `translate3d(${dir * (wrap.clientWidth + 260)}px,${d.dy * 0.32 + 60}px,0) rotate(${dir * 24}deg)`;
        d.card.style.opacity = "0";
        clearTimeout(cycleTimer);
        cycleTimer = setTimeout(() => {
          const o = orderRef.current;
          o.push(o.shift()!);
          layout(true);
        }, 300);
        return;
      }
      layout(true);
    };

    wrap.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      clearTimeout(cycleTimer);
      wrap.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [count]);

  // 라이트박스를 닫을 때 마지막으로 본 카드를 맨 위로 되돌린다 (원본 stackTo).
  const bringToFront = useCallback((i: number) => {
    const o = orderRef.current;
    const pos = o.indexOf(i);
    if (pos <= 0) return;
    o.unshift(...o.splice(pos));
    layoutRef.current(false);
  }, []);

  return { wrapRef, cardRefs, bringToFront };
}
