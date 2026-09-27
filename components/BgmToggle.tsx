"use client";
import { useEffect, useRef, useState } from "react";
import { armAutoplay } from "@/lib/autoplay";
import { useToast } from "./Toast";

// 앞 3초는 인트로라 건너뛴다. 반복 재생도 매번 여기서 시작한다.
const START_AT = 3.95;

export function BgmToggle() {
  const [on, setOn] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const say = useToast();

  // 일시정지 후 다시 켤 때는 멈춘 지점에서 이어간다 — 그때만 되감지 않는다.
  const play = async () => {
    const el = audio.current;
    if (!el) return;
    const seek = () => {
      if (el.currentTime < START_AT) el.currentTime = START_AT;
    };
    // iOS Safari 는 메타데이터가 도착하기 전의 currentTime 대입을 무시한다.
    // preload="none" 이라 첫 재생 때는 항상 readyState 0 이므로 로드 직후로 미룬다.
    // (preload="metadata" 로 바꿔봤지만 Chromium·WebKit 둘 다 6.7MB 를 통째로
    //  첫 화면에서 받아버려서 되돌렸다. 재생 전까지는 한 바이트도 받지 않는 게 맞다.)
    if (el.readyState === 0) {
      el.addEventListener("loadedmetadata", seek, { once: true });
    } else {
      seek();
    }
    await el.play();
    setOn(true);
  };

  // 제스처에 자동 재생. 거부되면 armAutoplay 가 다음 제스처에서 다시 시도한다.
  // 실패 토스트는 띄우지 않는다 — 하객이 요청한 동작이 아니라 페이지가 알아서 시도한 것이다.
  useEffect(() => armAutoplay(window, () => play()), []);

  const toggle = async () => {
    const el = audio.current;
    if (!el) return;
    if (on) {
      el.pause();
      setOn(false);
      say("배경음악을 껐어요");
      return;
    }
    try {
      await play();
      say("배경음악을 켰어요");
    } catch {
      say("배경음악을 재생할 수 없어요");
    }
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      {/* zoom 은 상속되지 않으므로 확대된 카드 폭(--card-w)에 직접 맞춘다.
          ponytail: 카드 내부 14px 여백이 확대 시 16.3px 가 되는 2px 차이는 무시한다. */}
      <div
        className="flex w-full justify-center px-3.5 pt-3.5"
        style={{ maxWidth: "var(--card-w)" }}
      >
        <audio
          ref={audio}
          src="/audio/bgm.mp3"
          preload="none"
          onEnded={() => {
            const el = audio.current;
            if (!el) return;
            el.currentTime = START_AT;
            void el.play().catch(() => setOn(false));
          }}
        />
        <button
          onClick={toggle}
          aria-label="배경음악"
          className="pointer-events-auto flex h-8 cursor-pointer appearance-none items-center gap-2 rounded-[99px] border border-[rgba(255,255,255,.28)] bg-[rgba(26,22,20,.32)] px-3 backdrop-blur-[10px] backdrop-saturate-[1.4] transition-colors duration-250 hover:bg-[rgba(26,22,20,.46)]"
        >
          <span className="flex h-3.25 items-end gap-[2.5px]">
            {[0, 0.18, 0.36].map((delay) => (
              <span
                key={delay}
                // 인라인 animation 대신 .eq-bar 클래스 — prefers-reduced-motion 블록이
                // 클래스 셀렉터로만 매칭해서 인라인으로 걸면 모션이 안 꺼진다.
                className="eq-bar w-0.5 origin-bottom rounded-[2px] bg-[#FFF7F3]"
                style={{
                  height: 13,
                  animationDelay: `${delay}s`,
                  animationPlayState: on ? "running" : "paused",
                  opacity: on ? 1 : 0.45,
                }}
              />
            ))}
          </span>
          <span className="text-[11.5px] tracking-[.14em] text-[rgba(255,247,243,.95)]">
            {on ? "ON" : "OFF"}
          </span>
        </button>
      </div>
    </div>
  );
}
