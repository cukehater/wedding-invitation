"use client";
import { SectionHeading } from "./SectionHeading";
import { MAP_APPS, TMAP, TRAFFIC_WAYS, VENUE } from "@/lib/data";
import type { RevealRef } from "@/hooks/useReveal";

// iPadOS 13+ 는 UA 가 Mac 으로 잡히지만 청첩장 트래픽은 사실상 폰이라 무시한다.
const openTmap = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  if (!/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    // 안드로이드는 intent:// 가 앱 실행과 미설치 폴백을 둘 다 처리한다.
    location.href = TMAP.androidIntent;
    return;
  }
  // ponytail: iOS 는 티맵 Universal Link 이 없어 커스텀 스킴이 열렸는지 알 방법이 없다.
  // 타이머 + visibility 휴리스틱 — 앱이 뜨면 문서가 hidden 되고 타이머가 취소된다.
  const timer = setTimeout(() => {
    if (!document.hidden) location.href = TMAP.iosStore;
  }, 1500);
  document.addEventListener("visibilitychange", () => clearTimeout(timer), {
    once: true,
  });
  location.href = TMAP.ios;
};

export function Location({ revealRef }: { revealRef: RevealRef }) {
  return (
    <section ref={revealRef} className="px-5 pt-11 pb-14">
      <SectionHeading title="LOCATION" />

      <div className="text-center">
        <div className="font-body text-[18px] tracking-[.06em] text-[#4A4A4A]">
          {VENUE.name}
        </div>
        <div className="mt-2 text-[11.5px] text-[#9A928C]">{VENUE.address}</div>
      </div>

      <div className="mx-auto overflow-hidden">
        <img loading="lazy" decoding="async"
          src="/images/map.webp"
          alt="더파티움 안양 약도"
          className="block w-full select-none object-cover aspect-[4/2.75]"
        />
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {MAP_APPS.map((m) => (
          <a
            key={m.name}
            href={m.href}
            onClick={m.scheme ? openTmap : undefined}
            target="_blank"
            rel="noopener"
            // box-content: 원본 버튼이 all:unset 으로 content-box 라 border 2px 가 높이에 더해진다 (총 38px)
            className="box-content flex h-9 cursor-pointer items-center gap-1.5 rounded-[99px] border
              border-[#EFE9EA] bg-white px-3.5 text-[12px] text-[#404040] shadow-[0_1px_4px_rgba(0,0,0,.04)]
              hover:border-[#E2D2D5]"
          >
            <img loading="lazy" decoding="async"
              src={m.logo}
              alt=""
              className="h-4 w-4 select-none rounded-[5px] object-contain"
            />
            {m.name}
          </a>
        ))}
      </div>

      <div className="mt-8 grid gap-7">
        {TRAFFIC_WAYS.map((w) => (
          // 색이 데이터에서 오므로 Tailwind 임의값 클래스로는 JIT 가 못 만든다.
          <div key={w.label} style={{ borderColor: w.color }} className="border-l pl-4">
            <div className="flex items-baseline gap-2">
              <span
                style={{ color: w.color }}
                className="font-heading text-[10px] font-semibold tracking-[.16em]"
              >
                {w.label}
              </span>
              <span className="text-[11.5px] text-[#B0A8A2]">{w.title}</span>
            </div>

            <p className="mt-2.5 mb-0 text-[12.5px] leading-[1.85] text-[#4A4A4A]">{w.lead}</p>

            {w.rows && (
              <div className="mt-2.5 grid gap-1.5">
                {w.rows.map((r) => (
                  <div key={r.k} className="flex gap-3 text-[12.5px] leading-[1.6]">
                    <span className="w-7 shrink-0 text-[#B0A8A2]">{r.k}</span>
                    <span className="text-[#5E5E5E]">{r.v}</span>
                  </div>
                ))}
              </div>
            )}

            {w.lots && (
              <ol className="mt-3.5 grid list-none gap-3 p-0">
                {w.lots.map((l, i) => (
                  <li key={l.name} className="flex gap-2.5">
                    <span className="mt-0.5 flex h-4.25 w-4.25 shrink-0 items-center justify-center
                      rounded-[99px] bg-[#F1ECE7] font-heading text-[9.5px] font-semibold text-[#8A8079]">
                      {i + 1}
                    </span>
                    <span className="grid gap-0.75">
                      <span className="text-[12.5px] leading-[1.45] text-[#4A4A4A]">{l.name}</span>
                      <span className="text-[11.5px] leading-[1.45] text-[#B0A8A2]">
                        {l.addr}
                        {l.note && <span className="text-[#C2856A]"> · {l.note}</span>}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ))}
      </div>

    </section>
  );
}
