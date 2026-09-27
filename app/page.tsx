"use client";
import { BgmToggle } from "@/components/BgmToggle";
import { Account } from "@/components/Account";
import { Contact } from "@/components/Contact";
import { Cover } from "@/components/Cover";
import { Gallery } from "@/components/Gallery";
import { GuestBook } from "@/components/GuestBook";
import { Information } from "@/components/Information";
import { Location } from "@/components/Location";
import { Outro } from "@/components/Outro";
import { WeddingDate } from "@/components/WeddingDate";
import { useReveal } from "@/hooks/useReveal";

export default function Home() {
  const reveal = useReveal();

  return (
    <div className="flex min-h-screen justify-center bg-[#EDEAE6]">
      <BgmToggle />
      <div
        style={{ zoom: "var(--card-zoom)" }}
        className="relative w-full max-w-[430px] overflow-hidden bg-white
        bg-[url('/images/bg-tile.webp')] bg-[length:430px_auto] bg-top bg-repeat
        font-body text-[#5E5E5E] shadow-[0_0_60px_rgba(60,50,52,.14)]"
      >
        <Cover />

        {/* s2 · MAIN PHOTO */}
        <section ref={reveal} className="relative pt-10">
          <img
            src="/images/double-heart.webp"
            alt=""
            // 가운데 정렬은 mx-auto 로. -translate-x-1/2 는 wsticker 의 transform 에 덮어써진다.
            className="pointer-events-none absolute inset-x-0 top-[16%] z-2 mx-auto w-[78px] select-none
              mix-blend-multiply animate-[wsticker_1.9s_steps(1,end)_infinite]"
          />
          <img
            src="/images/main-photo.webp"
            alt="김홍창·박귀자의 아들 김경식, 윤경애의 딸 김수민"
            className="block h-auto w-full select-none"
          />
        </section>

        {/* s3 · 초대 인사말 */}
        <section
          ref={reveal}
          className="relative flex justify-center px-7 py-10"
        >
          <img
            src="/images/heart.webp"
            alt=""
            className="pointer-events-none absolute top-2 right-[14px] z-2 w-[104px] select-none opacity-90 mix-blend-multiply
              animate-[wheart_1.6s_steps(1,end)_infinite]"
          />
          <img
            src="/images/sticker-clip.webp"
            alt=""
            // 430px 디자인 기준 left/bottom 40px 를 섹션 대비 % 로 환산. 카드 폭이 줄어도 비율이 유지된다.
            // 기울기는 wsticker 키프레임에 들어 있어 -rotate-* 클래스로는 못 준다 (transform 이 덮어써짐).
            className="pointer-events-none absolute bottom-[10.9%] left-[9.3%] z-2 w-[52px] select-none
              animate-[wsticker_2.2s_steps(1,end)_infinite]"
          />
          <img
            src="/images/letter.webp"
            alt="초대 인사말"
            className="block h-auto w-full select-none"
          />
        </section>

        <WeddingDate revealRef={reveal} />
        <Gallery revealRef={reveal} />
        <Location revealRef={reveal} />
        <Information revealRef={reveal} />
        <GuestBook revealRef={reveal} />
        <Contact revealRef={reveal} />
        <Account revealRef={reveal} />
        <Outro revealRef={reveal} />
      </div>
    </div>
  );
}
