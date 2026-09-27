import { SectionHeading } from "./SectionHeading";
import { CONTACTS } from "@/lib/data";
import type { RevealRef } from "@/hooks/useReveal";

// box-content: 원본 버튼이 all:unset 으로 content-box 라 border 가 크기에 더해진다.
const PILL = "box-content cursor-pointer rounded-[99px] border px-3 py-1.5 text-[11px]";

export function Contact({ revealRef }: { revealRef: RevealRef }) {
  return (
    <section ref={revealRef} className="px-7 pt-10">
      <SectionHeading title="CONTACT" />
      <div className="mx-auto max-w-80 overflow-hidden rounded-[26px] border border-[#F1ECE7]
        shadow-[0_3px_12px_rgba(0,0,0,.05)]">
        <div className="grid gap-2 bg-[rgb(253,252,252)] px-4 py-4.5">
          {CONTACTS.map((c) => (
            <div key={c.role + c.name}
              className="flex items-center justify-between gap-2.5 rounded-[14px] bg-[#FBF8F5] px-3.5 py-3">
              <span className="grid gap-0.75">
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
      </div>
    </section>
  );
}
