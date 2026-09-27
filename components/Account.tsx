"use client";
import { useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { ACCOUNT_SIDES } from "@/lib/data";
import { useToast } from "./Toast";
import type { RevealRef } from "@/hooks/useReveal";

// ponytail: navigator.clipboard 는 보안 컨텍스트(https/localhost)에만 존재한다. 폰에서 LAN dev(http) 로
// 열거나 클립보드를 막는 인앱 웹뷰에서는 deprecated 지만 여전히 동작하는 execCommand 로 떨어진다.
const legacyCopy = (text: string) => {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  // globals.css 의 body { user-select: none } 때문에 WebKit 에서 선택이 안 된다. 여기서만 되돌린다.
  ta.style.cssText =
    "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;user-select:text;-webkit-user-select:text";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length); // iOS 는 select() 만으로 범위가 안 잡힌다
  const ok = document.execCommand("copy");
  ta.remove();
  return ok;
};

export function Account({ revealRef }: { revealRef: RevealRef }) {
  // 원본의 s.acct 와 동일하게 한 번에 한쪽만 열린다.
  const [open, setOpen] = useState<string | null>(null);
  const say = useToast();

  const copy = async (text: string, who: string) => {
    let ok = false;
    // writeText 가 없으면 await 없이 바로 폴백한다. iOS 는 await 후 유저 제스처가 끊겨
    // execCommand 가 실패할 수 있다.
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {}
    }
    if (!ok) ok = legacyCopy(text);
    say(ok ? `${who} 계좌번호가 복사되었어요` : "복사에 실패했어요. 길게 눌러 직접 복사해 주세요");
  };

  return (
    <section ref={revealRef} className="px-7 pt-14 pb-[60px] text-center">
      <SectionHeading title="마음 전하실 곳" />
      <p className="mt-0 mb-[26px] text-[13px] leading-[1.95] text-[#5E5E5E]">
        축하의 자리에 함께하지 못하시는 분들을 위해<br />계좌번호를 기재합니다.<br /><br />
        소중한 축하를 보내주심에 깊이 감사드립니다.
      </p>

      <div className="mx-auto grid max-w-[320px] gap-3 text-left">
        {ACCOUNT_SIDES.map((s) => {
          const isOpen = open === s.key;
          return (
            <div key={s.key} className="overflow-hidden rounded-[24px] border border-[#F1ECE7]
              shadow-[0_3px_12px_rgba(0,0,0,.04)]">
              <button
                onClick={() => setOpen(isOpen ? null : s.key)}
                aria-expanded={isOpen}
                className="relative flex h-[46px] w-full cursor-pointer appearance-none items-center
                  justify-center bg-[rgb(253,252,252)] text-[13.5px] text-[#404040] hover:bg-[#FCFAFA]"
              >
                <span>{s.title}</span>
                <span aria-hidden="true" className="absolute right-[18px] text-[11px] text-[#C9C1BE] transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
              {isOpen && (
                <div className="grid animate-[wfade_.35s_ease_both] gap-2 bg-[rgb(253,252,252)] px-[14px] pt-0.5 pb-4">
                  {s.rows.map((r) => (
                    <button key={r.acct} onClick={() => copy(r.acct, r.name)}
                      className="flex cursor-pointer appearance-none items-center justify-between gap-2.5
                        rounded-[14px] bg-[#FBF8F5] px-[14px] py-[13px] hover:bg-[#F8F1E9]">
                      <span className="grid gap-1 text-left">
                        <span className="text-[10.5px] tracking-[.06em] text-[#B0A8A2]">{r.role} {r.name}</span>
                        <span className="text-[12.5px] text-[#4A4A4A]">{r.acct}</span>
                      </span>
                      <span className="rounded-[99px] border border-[#FFDCBC] px-[11px] py-1.5
                        text-[10.5px] whitespace-nowrap text-[#FF9A42]">복사</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
