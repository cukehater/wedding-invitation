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
      <div style={{ zoom: "var(--card-zoom)" }}
        className="relative w-full max-w-[430px] overflow-hidden bg-white
        bg-[url('/images/bg-tile.png')] bg-[length:430px_auto] bg-top bg-repeat
        font-body text-[#5E5E5E] shadow-[0_0_60px_rgba(60,50,52,.14)]">

        <BgmToggle />
        <Cover />

        {/* s2 · MAIN PHOTO */}
        <section ref={reveal} className="pt-10">
          <img src="/images/main-photo.webp"
            alt="김홍창·박귀자의 아들 김경식, 윤경애의 딸 김수민"
            className="block h-auto w-full select-none" />
        </section>

        {/* s3 · 초대 인사말 */}
        <section ref={reveal} className="relative flex justify-center px-7 pt-[52px] pb-2">
          <img src="/images/heart.png" alt=""
            className="pointer-events-none absolute top-2 right-[14px] z-2 w-[104px] select-none opacity-90 mix-blend-multiply" />
          <img src="/images/sticker-clip.webp" alt=""
            className="pointer-events-none absolute bottom-[6px] left-[18px] z-2 w-[52px] -rotate-12 select-none" />
          <img src="/images/greeting.png" alt="초대 인사말" className="block h-auto w-full select-none" />
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
