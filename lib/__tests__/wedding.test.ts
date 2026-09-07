import { describe, expect, it } from "vitest";
import { WEDDING_AT, calendarRows, countdownUnits } from "@/lib/wedding";

describe("countdownUnits", () => {
  it("예식 2일 3시간 4분 5초 전이면 각 단위를 2자리로 채운다", () => {
    const now = WEDDING_AT.getTime() - ((2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000);
    expect(countdownUnits(now)).toEqual([
      { value: "2", label: "DAYS", hasSep: true },
      { value: "03", label: "HOUR", hasSep: true },
      { value: "04", label: "MIN", hasSep: true },
      { value: "05", label: "SEC", hasSep: false },
    ]);
  });

  it("예식 시각이 지나면 전부 0으로 고정된다", () => {
    expect(countdownUnits(WEDDING_AT.getTime() + 999_999).map((u) => u.value))
      .toEqual(["0", "00", "00", "00"]);
  });
});

describe("calendarRows", () => {
  const rows = calendarRows();

  it("5행 7열이다", () => {
    expect(rows).toHaveLength(5);
    rows.forEach((r) => expect(r).toHaveLength(7));
  });

  it("1일부터 30일까지 채우고 남는 칸은 빈 문자열이다", () => {
    expect(rows.flat().map((c) => c.label).filter(Boolean))
      .toEqual(Array.from({ length: 30 }, (_, i) => String(i + 1)));
    expect(rows[4].slice(2).every((c) => c.label === "")).toBe(true);
  });

  it("29일만 isTarget 이다", () => {
    expect(rows.flat().filter((c) => c.isTarget).map((c) => c.label)).toEqual(["29"]);
  });
});
