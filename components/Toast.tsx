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
      {/* 토스트는 카드 바깥이라 zoom 을 따로 걸어줘야 카드 콘텐츠와 크기가 맞는다.
          계좌 복사·방명록 등록/삭제·BGM 의 유일한 피드백이라 스크린리더에도 읽혀야 한다.
          live 영역은 내용과 함께 DOM 에 삽입되면 변화로 인식되지 않으므로 래퍼는 항상
          렌더하고 말풍선만 조건부로 넣는다. polite: 하객이 타이핑 중이면 끝난 뒤 읽는다. */}
      <div role="status" aria-live="polite" style={{ zoom: "var(--card-zoom)" }}
        className="pointer-events-none fixed inset-x-0 bottom-8 z-70 flex justify-center">
        {msg && (
          <div className="animate-[wfade_.25s_ease_both] whitespace-nowrap rounded-[99px] bg-[rgba(35,29,28,.92)] px-5 py-3 text-[12.5px] text-[#FFF7F3]">
            {msg}
          </div>
        )}
      </div>
    </ToastCtx.Provider>
  );
}
