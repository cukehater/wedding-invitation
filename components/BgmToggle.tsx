"use client";
import { useRef, useState } from "react";
import { useToast } from "./Toast";

export function BgmToggle() {
  const [on, setOn] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const say = useToast();

  const toggle = async () => {
    const el = audio.current;
    if (!el) return;
    if (on) { el.pause(); setOn(false); say("배경음악을 껐어요"); return; }
    try {
      await el.play();
      setOn(true);
      say("배경음악을 켰어요");
    } catch {
      say("배경음악을 재생할 수 없어요");
    }
  };

  return (
    <div className="sticky top-0 z-40 flex h-0 justify-center">
      <audio ref={audio} src="/bgm.mp3" loop preload="none" />
      <button
        onClick={toggle}
        aria-label="배경음악"
        className="mx-[14px] mt-[14px] flex h-8 cursor-pointer appearance-none items-center gap-2 rounded-[99px] border border-[rgba(255,255,255,.28)] bg-[rgba(26,22,20,.32)] px-3 backdrop-blur-[10px] backdrop-saturate-[1.4] transition-colors duration-250 hover:bg-[rgba(26,22,20,.46)]"
      >
        <span className="flex h-[13px] items-end gap-[2.5px]">
          {[0, 0.18, 0.36].map((delay) => (
            <span
              key={delay}
              className="w-[2px] origin-bottom rounded-[2px] bg-[#FFF7F3]"
              style={{
                height: 13,
                animation: `weq .9s ease-in-out ${delay}s infinite`,
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
  );
}
