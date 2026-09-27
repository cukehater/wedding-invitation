"use client";
import { SectionHeading } from "./SectionHeading";
import { MAP_APPS, TMAP, TRAFFIC_WAYS, VENUE } from "@/lib/data";

// ponytail: 커스텀 스킴이 실제로 열렸는지 알 방법이 없어 타이머 + visibility 휴리스틱.
// 앱이 뜨면 문서가 hidden 되고 타이머가 취소된다. 안 뜨면 스토어로 보낸다.
// iPadOS 13+ 는 UA 가 Mac 으로 잡히지만 청첩장 트래픽은 사실상 폰이라 무시한다.
const openTmap = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const timer = setTimeout(() => {
    if (!document.hidden) location.href = ios ? TMAP.iosStore : TMAP.androidStore;
  }, 1500);
  document.addEventListener("visibilitychange", () => clearTimeout(timer), {
    once: true,
  });
  location.href = ios ? TMAP.ios : TMAP.android;
};

export function Location({
  revealRef,
}: {
  revealRef: (n: HTMLElement | null) => void;
}) {
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
        <img
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
            <img
              src={m.logo}
              alt=""
              className="h-4 w-4 select-none rounded-[5px] object-contain"
            />
            {m.name}
          </a>
        ))}
      </div>

      <div className="mt-[22px] grid gap-5 overflow-hidden rounded-2xl border border-[#F1ECEC]
        bg-[rgb(253,252,252)] px-[22px] py-6">
        {TRAFFIC_WAYS.map((w, i) => (
          <div key={w.title} className={i ? "border-t border-[#F1ECEC] pt-5" : undefined}>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-[99px] bg-[#FF9A42]" />
              <span className="text-[13px] text-[#404040]">{w.title}</span>
            </div>
            <div className="mt-2 text-[12.5px] leading-[1.95] whitespace-pre-line text-[#5E5E5E]">
              {w.body}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
