"use client";
import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import { INFO_IMAGES, INFO_TEXTS } from "@/lib/data";

const MASK =
  "linear-gradient(to right,transparent 0,#000 16%,#000 74%,transparent 100%)";

export function Information({
  revealRef,
}: {
  revealRef: (n: HTMLElement | null) => void;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setI((v) => (v + 1) % INFO_TEXTS.length),
      4200,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={revealRef} className="pt-11 pb-[52px]">
      <SectionHeading title="INFOMATION" />
      <div
        onClick={() => setI((v) => (v + 1) % INFO_TEXTS.length)}
        style={{ WebkitMaskImage: MASK, maskImage: MASK }}
        className="relative mx-auto aspect-1779/612 w-[85%] cursor-pointer overflow-hidden bg-[#F1EAE6] px-[37.5px]"
      >
        {INFO_IMAGES.map((name, idx) => (
          <img
            key={name}
            src={`/images/gallery/${name}.webp`}
            alt=""
            style={{ opacity: idx === i ? 1 : 0 }}
            className="absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-1100 ease-out"
          />
        ))}
      </div>
      <p className="mx-auto mt-7 max-w-[290px] text-center font-body text-[13.5px] leading-[1.95] text-[#6B6360]">
        {INFO_TEXTS[i]}
      </p>
      <div className="mt-5 flex justify-center gap-1.5">
        {INFO_TEXTS.map((_, idx) => (
          <span
            key={idx}
            style={{ background: idx === i ? "#2E2A27" : "#DED8D6" }}
            className="h-1 w-1 rounded-[99px] transition-all duration-350"
          />
        ))}
      </div>
    </section>
  );
}
