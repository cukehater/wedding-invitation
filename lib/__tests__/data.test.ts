import { describe, expect, it } from "vitest";
import { ACCOUNT_SIDES, CONTACTS, INFO_TEXTS } from "@/lib/data";

// 하객이 읽는 문구에 개발 중 남긴 토큰이 섞이면 안 된다.
const PLACEHOLDER = /\{[A-Z_]+\}|TODO|TBD|FIXME|XXX|＿＿|__/;

describe("하객에게 보이는 문구", () => {
  it("INFO_TEXTS 에 플레이스홀더가 없다", () => {
    for (const t of INFO_TEXTS) expect(t).not.toMatch(PLACEHOLDER);
  });

  it("연락처 전화번호가 모두 형식에 맞다", () => {
    for (const c of CONTACTS) expect(c.tel).toMatch(/^01\d-\d{3,4}-\d{4}$/);
  });

  it("계좌 문구에 은행명과 번호가 모두 있다", () => {
    for (const side of ACCOUNT_SIDES)
      for (const r of side.rows) expect(r.acct).toMatch(/^\S+ [\d-]+$/);
  });
});
