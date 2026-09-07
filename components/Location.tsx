import { SectionHeading } from "./SectionHeading";
import { Accordion } from "./Accordion";
import { MAP_APPS, TRAFFIC_WAYS, VENUE } from "@/lib/data";

const OSM = `https://www.openstreetmap.org/export/embed.html?bbox=126.9620%2C37.3900%2C126.9780%2C37.3990&layer=mapnik&marker=${VENUE.lat}%2C${VENUE.lng}`;

export function Location({ revealRef }: { revealRef: (n: HTMLElement | null) => void }) {
  return (
    <section ref={revealRef} className="px-5 pt-11 pb-14">
      <SectionHeading title="LOCATION" />

      <div className="text-center">
        <div className="font-body text-[18px] tracking-[.06em] text-[#4A4A4A]">{VENUE.name}</div>
        <div className="mt-2 text-[11.5px] text-[#9A928C]">{VENUE.address}</div>
      </div>

      <div className="mx-auto mt-[22px] overflow-hidden rounded-[14px] bg-white">
        <iframe src={OSM} title={`${VENUE.query} 지도`} loading="lazy"
          className="block aspect-video w-full border-0" />
        <a href={`https://map.kakao.com/?q=${encodeURIComponent(VENUE.query)}`}
          target="_blank" rel="noopener"
          className="flex h-[42px] items-center justify-center border-t border-[#F1ECEC]
            text-[12px] tracking-[.02em] text-[#404040]">
          카카오맵에서 크게 보기
        </a>
      </div>

      <div className="mt-3 flex justify-center gap-2">
        {MAP_APPS.map((m) => (
          <a key={m.name} href={m.href} target="_blank" rel="noopener"
            // box-content: 원본 버튼이 all:unset 으로 content-box 라 border 2px 가 높이에 더해진다 (총 42px)
            className="box-content flex h-10 cursor-pointer items-center gap-[7px] rounded-[99px] border
              border-[#EFE9EA] px-4 text-[12.5px] text-[#404040] shadow-[0_1px_4px_rgba(0,0,0,.04)]
              hover:border-[#E2D2D5]">
            <span className="h-4 w-4 rounded-[5px]" style={{ background: m.tint }} />
            {m.name}
          </a>
        ))}
      </div>

      <div className="mt-[22px] overflow-hidden rounded-2xl border border-[#F1ECEC]">
        <Accordion label="교통정보 펼쳐보기" openLabel="교통정보 접기">
          <div className="grid animate-[wfade_.35s_ease_both] gap-5 bg-[rgb(253,252,252)] px-[22px] pt-0.5 pb-6">
            {TRAFFIC_WAYS.map((w) => (
              <div key={w.title}>
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
        </Accordion>
      </div>
    </section>
  );
}
