import type { CSSProperties } from "react";

/** 종이 스티커 데코. 위치는 부모(relative) 기준, 흔들림은 globals.css 의 .boil 이 담당한다. */
export function Sticker({
  src,
  className,
  tilt,
  dur,
  delay = "0s",
}: {
  src: string; // public/images 하위 파일명
  className: string; // 위치 · 크기 · 블렌드
  tilt: string; // 멈춰 있을 때의 기본 기울기
  dur: string; // boil 한 바퀴 주기
  // 음수 delay = 로드 시점에 이미 다른 프레임에 가 있다. 스티커끼리 박자가 겹치지 않는다.
  delay?: string;
}) {
  return (
    <img
      loading="lazy"
      decoding="async"
      src={`/images/${src}`}
      alt=""
      style={{ "--t": tilt, "--d": dur, "--dl": delay } as CSSProperties}
      className={`boil pointer-events-none absolute z-2 select-none ${className}`}
    />
  );
}
