"use client";
import { useState } from "react";

export function Accordion({
  label, openLabel, height = 50, children,
}: { label: string; openLabel?: string; height?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ height }}
        className="relative flex w-full cursor-pointer appearance-none items-center justify-center bg-[rgb(253,252,252)] text-[13px] text-[#404040] hover:bg-[#FCFAFA]"
      >
        <span>{open && openLabel ? openLabel : label}</span>
        <span
          className="absolute right-5 text-[11px] text-[#C9C1BE] transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>
      {open && children}
    </>
  );
}
