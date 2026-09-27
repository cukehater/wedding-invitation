export function Cover() {
  return (
    <section className="relative aspect-[1/1.75] min-h-[560px] overflow-hidden bg-[#EFEAE4]">
      <img fetchPriority="high"
        src="/images/hero.webp"
        alt="cover"
        className="absolute inset-0 h-full w-full select-none object-cover grayscale"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[58%]
        bg-[linear-gradient(180deg,rgba(28,20,12,.62)_0%,rgba(28,20,12,.46)_34%,rgba(28,20,12,.2)_70%,rgba(28,20,12,0)_100%)]"
      />
      <div className="pointer-events-none absolute inset-0 px-6 pt-[26px]">
        <div
          className="flex animate-[wfade_1.4s_ease_both] items-start justify-between
          font-heading text-[14px] font-medium leading-[1.05] tracking-[-.045em] text-[#FF9A42]"
        >
          <div>
            Save
            <br />
            the
            <br />
            Date
          </div>
          <div className="text-right">
            2026
            <br />
            Nov
          </div>
        </div>
        <div
          className="mt-[34px] animate-[wfade_1.6s_ease_.2s_both] text-center
          font-script text-[54px] leading-[1.05] text-[#FF9A42]"
        >
          Our Wedding Day
        </div>
        <div
          className="mx-auto mt-4 flex w-[50vw] max-w-[215px] animate-[wfade_1.6s_ease_.4s_both]
          items-center gap-[14px] font-serif-display text-[20px] tracking-[.04em] text-[#FF9A42]"
        >
          <span>11</span>
          <span className="h-px flex-1 bg-[rgba(255,154,66,.7)]" />
          <span>29</span>
        </div>
      </div>
    </section>
  );
}
