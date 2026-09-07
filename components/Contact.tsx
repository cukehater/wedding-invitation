import { SectionHeading } from "./SectionHeading";
import { Accordion } from "./Accordion";
import { CONTACTS } from "@/lib/data";

// box-content: 원본 버튼이 all:unset 으로 content-box 라 border 가 크기에 더해진다.
const PILL = "box-content cursor-pointer rounded-[99px] border px-3 py-1.5 text-[11px]";

export function Contact({ revealRef }: { revealRef: (n: HTMLElement | null) => void }) {
  return (
    <section ref={revealRef} className="px-7 pt-10">
      <SectionHeading title="CONTACT" />
      <div className="mx-auto max-w-[320px] overflow-hidden rounded-[26px] border border-[#F1ECE7]
        shadow-[0_3px_12px_rgba(0,0,0,.05)]">
        <Accordion label="연락하기" height={52}>
          <div className="grid animate-[wfade_.35s_ease_both] gap-2 bg-[rgb(253,252,252)] px-4 pt-0.5 pb-[18px]">
            {CONTACTS.map((c) => (
              <div key={c.role + c.name}
                className="flex items-center justify-between gap-2.5 rounded-[14px] bg-[#FBF8F5] px-[14px] py-3">
                <span className="grid gap-[3px]">
                  <span className="text-[10.5px] tracking-[.06em] text-[#B0A8A2]">{c.role}</span>
                  <span className="text-[13px] text-[#4A4A4A]">{c.name}</span>
                </span>
                <span className="flex gap-1.5">
                  <a href={`tel:${c.tel}`} className={`${PILL} border-[#FFDCBC] text-[#FF9A42]`}>전화</a>
                  <a href={`sms:${c.tel}`} className={`${PILL} border-[#EFE9EA] text-[#8A8079]`}>문자</a>
                </span>
              </div>
            ))}
          </div>
        </Accordion>
      </div>
    </section>
  );
}
