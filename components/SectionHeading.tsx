export function SectionHeading({ title }: { title: string }) {
  return (
    <>
      <div className="text-center font-serif-display text-[20px] leading-none text-[#2E2A27]">
        <span className="inline-block animate-[wspin_9s_linear_infinite]">✳</span>
      </div>
      <h3 className="mt-4 mb-[30px] text-center font-heading text-[22px] font-normal leading-none tracking-normal text-[#2E2A27]">
        {title}
      </h3>
    </>
  );
}
