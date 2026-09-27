"use client";
import { BgmToggle } from "@/components/BgmToggle";
import { Account } from "@/components/Account";
import { Contact } from "@/components/Contact";
import { Cover } from "@/components/Cover";
import { Gallery } from "@/components/Gallery";
import { GuestBook } from "@/components/GuestBook";
import { Information } from "@/components/Information";
import { Location } from "@/components/Location";
import { Sticker } from "@/components/Sticker";
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
        className="relative w-full max-w-107.5 overflow-hidden bg-white
        bg-[url('/images/bg-tile.webp')] bg-[length:430px_auto] bg-top bg-repeat
        font-body text-[#5E5E5E] shadow-[0_0_60px_rgba(60,50,52,.14)]"
      >
        <Cover />

        {/* s2 · MAIN PHOTO */}
        <section ref={reveal} className="relative pt-10">
          {/* 가운데 정렬은 mx-auto 로. -translate-x-1/2 는 wboil 의 transform 에 덮어써진다. */}
          <Sticker src="double-heart.webp" tilt="-8deg" dur="1.9s"
            className="inset-x-0 top-[16%] mx-auto w-19.5 mix-blend-multiply"
          />
          <img loading="lazy" decoding="async"
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
          <Sticker src="heart.webp" tilt="-3deg" dur="2.25s" delay="-0.6s"
            className="top-2 right-3.5 w-26 opacity-90 mix-blend-multiply"
          />
          {/* 430px 디자인 기준 left/bottom 40px 를 섹션 대비 % 로 환산. 카드 폭이 줄어도 비율이 유지된다. */}
          <Sticker src="sticker-clip.webp" tilt="-8deg" dur="2.9s" delay="-1.4s"
            className="bottom-[10.9%] left-[9.3%] w-13"
          />
          <img loading="lazy" decoding="async"
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
