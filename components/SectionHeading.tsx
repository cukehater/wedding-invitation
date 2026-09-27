export function SectionHeading({ title }: { title: string }) {
  return (
    <>
      <div className="flex justify-center">
        <img
          src="/images/glyph.webp"
          alt=""
          className="h-5 w-5 select-none animate-[wspin_9s_linear_infinite]"
        />
      </div>
      <h3 className="mt-4 mb-[30px] text-center font-heading text-[22px] font-normal leading-none tracking-normal text-[#2E2A27]">
        {title}
      </h3>
    </>
  );
}
