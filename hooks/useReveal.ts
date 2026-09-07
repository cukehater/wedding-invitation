"use client";
import { useCallback, useEffect, useRef } from "react";

const show = (n: HTMLElement) => {
  n.style.opacity = "";
  n.style.animation = "wfade .9s cubic-bezier(.22,.7,.25,1) both";
};

export function useReveal() {
  const nodes = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { show(e.target as HTMLElement); observer.unobserve(e.target); }
      }),
      { threshold: 0.06 },
    );

    nodes.current.forEach((n) => {
      if (n.getBoundingClientRect().top < window.innerHeight * 0.95) { show(n); return; }
      n.style.opacity = "0";
      observer.observe(n);
    });

    // 옵저버가 어떤 이유로든 안 돌면 4초 뒤 강제로 보여준다 (원본 동작).
    const fallback = setTimeout(
      () => nodes.current.forEach((n) => { if (getComputedStyle(n).opacity === "0") show(n); }),
      4000,
    );

    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, []);

  return useCallback((node: HTMLElement | null) => {
    if (node && !nodes.current.includes(node)) nodes.current.push(node);
  }, []);
}
