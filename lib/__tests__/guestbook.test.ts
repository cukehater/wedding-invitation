import { describe, expect, it } from "vitest";
import {
  MSG_MAX,
  NAME_MAX,
  formatDate,
  hashPassword,
  validateEntry,
  verifyPassword,
} from "@/lib/guestbook";

describe("hashPassword / verifyPassword", () => {
  it("같은 비밀번호라도 매번 다른 해시를 만든다", () => {
    expect(hashPassword("1234")).not.toBe(hashPassword("1234"));
  });

  it("해시 형식은 scrypt$salt$hash 세 조각이다", () => {
    expect(hashPassword("1234").split("$")).toHaveLength(3);
  });

  it("올바른 비밀번호를 통과시킨다", () => {
    expect(verifyPassword("1234", hashPassword("1234"))).toBe(true);
  });

  it("틀린 비밀번호를 거부한다", () => {
    expect(verifyPassword("9999", hashPassword("1234"))).toBe(false);
  });

  it("길이가 다른 비밀번호도 throw 없이 거부한다", () => {
    expect(verifyPassword("1", hashPassword("12345678"))).toBe(false);
  });

  it("깨진 해시 문자열에 대해 throw 하지 않고 false 를 준다", () => {
    for (const broken of ["", "garbage", "scrypt$onlytwo", "scrypt$zz$zz"]) {
      expect(verifyPassword("1234", broken)).toBe(false);
    }
  });
});

describe("validateEntry", () => {
  const good = { name: "이서연", password: "1234", msg: "축하해요" };

  it("정상 입력을 통과시키고 앞뒤 공백을 제거한다", () => {
    const r = validateEntry({ name: "  이서연  ", password: "1234", msg: "  축하해요  " });
    expect(r).toEqual({ ok: true, value: { name: "이서연", password: "1234", msg: "축하해요" } });
  });

  it("비밀번호는 trim 하지 않는다", () => {
    const r = validateEntry({ ...good, password: " 12 4 " });
    expect(r.ok && r.value.password).toBe(" 12 4 ");
  });

  it("빈 이름을 거부한다", () => {
    expect(validateEntry({ ...good, name: "   " }).ok).toBe(false);
  });

  it("빈 메시지를 거부한다", () => {
    expect(validateEntry({ ...good, msg: "" }).ok).toBe(false);
  });

  it("이름 길이 상한을 넘기면 거부한다", () => {
    expect(validateEntry({ ...good, name: "가".repeat(NAME_MAX + 1) }).ok).toBe(false);
    expect(validateEntry({ ...good, name: "가".repeat(NAME_MAX) }).ok).toBe(true);
  });

  it("메시지 길이 상한을 넘기면 거부한다", () => {
    expect(validateEntry({ ...good, msg: "가".repeat(MSG_MAX + 1) }).ok).toBe(false);
    expect(validateEntry({ ...good, msg: "가".repeat(MSG_MAX) }).ok).toBe(true);
  });

  it("너무 짧은 비밀번호를 거부한다", () => {
    expect(validateEntry({ ...good, password: "12" }).ok).toBe(false);
  });

  it("문자열이 아닌 값을 거부한다", () => {
    expect(validateEntry({ name: 1, password: "1234", msg: "축하" }).ok).toBe(false);
    expect(validateEntry({ name: "이름", password: null, msg: "축하" }).ok).toBe(false);
    expect(validateEntry({ name: "이름", password: "1234", msg: {} }).ok).toBe(false);
  });

  it("거부할 때는 사람이 읽을 수 있는 한글 사유를 준다", () => {
    const r = validateEntry({ ...good, name: "" });
    expect(r.ok).toBe(false);
    expect(r.ok === false && r.error.length).toBeGreaterThan(0);
  });
});

describe("formatDate", () => {
  it("UTC 인스턴트를 KST 날짜로 바꾼다", () => {
    // 2026-09-20T15:30:00Z 는 한국 시간으로 9월 21일 0시 30분이다.
    expect(formatDate(new Date("2026-09-20T15:30:00Z"))).toBe("2026.09.21");
  });

  it("월·일을 두 자리로 채운다", () => {
    expect(formatDate(new Date("2026-01-05T03:00:00Z"))).toBe("2026.01.05");
  });
});
