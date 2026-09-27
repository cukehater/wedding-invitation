import { describe, expect, it } from "vitest";
import { WEDDING_AT, calendarRows, countdownUnits, p2 } from "@/lib/wedding";

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

describe("WEDDING_AT", () => {
  // 실행 환경 타임존과 무관하게 KST 2026-11-29 16:20 한 점을 가리켜야 한다.
  // 로컬 타임존 해석이면 이 값이 TZ 에 따라 흔들린다.
  // 위 countdownUnits 테스트들이 전부 WEDDING_AT 기준 상대시각이라 TZ 가 틀려도 통과한다 —
  // 그래서 이 절대값 단정이 필요하다.
  it("KST 2026-11-29 16:20 을 가리킨다", () => {
    expect(WEDDING_AT.toISOString()).toBe("2026-11-29T07:20:00.000Z");
  });

  it("예식 시각 그 순간에는 모든 단위가 0 이다", () => {
    const units = countdownUnits(WEDDING_AT.getTime());
    expect(units.map((u) => u.value)).toEqual(["0", "00", "00", "00"]);
  });
});

describe("p2", () => {
  it("한 자리는 0 을 채운다", () => {
    expect(p2(0)).toBe("00");
    expect(p2(9)).toBe("09");
  });

  it("두 자리 이상은 그대로 둔다", () => {
    expect(p2(10)).toBe("10");
    expect(p2(123)).toBe("123");
  });
});
