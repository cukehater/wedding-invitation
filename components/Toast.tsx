"use client";
import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const say = useCallback((m: string) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(""), 1800);
  }, []);

  return (
    <ToastCtx.Provider value={say}>
      {children}
      {/* 토스트는 카드 바깥이라 zoom 을 따로 걸어줘야 카드 콘텐츠와 크기가 맞는다. */}
      {msg && (
        <div style={{ zoom: "var(--card-zoom)" }}
          className="pointer-events-none fixed inset-x-0 bottom-8 z-70 flex justify-center">
          <div className="animate-[wfade_.25s_ease_both] whitespace-nowrap rounded-[99px] bg-[rgba(35,29,28,.92)] px-5 py-3 text-[12.5px] text-[#FFF7F3]">
            {msg}
          </div>
        </div>
      )}
    </ToastCtx.Provider>
  );
}
