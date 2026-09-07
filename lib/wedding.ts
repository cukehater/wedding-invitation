export const WEDDING_AT = new Date(2026, 10, 29, 16, 20);

const p2 = (n: number) => String(n).padStart(2, "0");

export function countdownUnits(nowMs: number) {
  const diff = Math.max(0, WEDDING_AT.getTime() - nowMs);
  return [
    { value: String(Math.floor(diff / 86400000)), label: "DAYS", hasSep: true },
    { value: p2(Math.floor(diff / 3600000) % 24), label: "HOUR", hasSep: true },
    { value: p2(Math.floor(diff / 60000) % 60), label: "MIN", hasSep: true },
    { value: p2(Math.floor(diff / 1000) % 60), label: "SEC", hasSep: false },
  ];
}

export function calendarRows() {
  let day = 1;
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 7 }, () => {
      if (day > 30) return { label: "", isTarget: false };
      const label = String(day);
      const isTarget = day === 29;
      day++;
      return { label, isTarget };
    }),
  );
}
