import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type Guest = { id: string; name: string; date: string; msg: string };

export const NAME_MAX = 20;
export const MSG_MAX = 40;
export const PASSWORD_MIN = 4;
export const PASSWORD_MAX = 20;

const KEY_LEN = 32;

// bcrypt/argon2 를 받지 않으려고 Node 내장 scrypt 를 쓴다. 방명록 비밀번호는
// 계정 자격증명이 아니라 "내 글만 지우기" 용도라 이 강도면 충분하다.
export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  // DB 값이 깨져 있어도 500 이 아니라 "비밀번호가 틀렸다" 로 수렴해야 한다.
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  try {
    // never-throws 를 보장하는 건 이 try/catch 다 — timingSafeEqual 이 길이 불일치로
    // 던져도 catch 가 흡수한다. 아래 길이 체크는 정확성 보장이 아니라 깨진 행에 대해
    // scryptSync 비용을 미리 피하는 최적화일 뿐이므로, try 범위를 좁히면 이를 잡아줄 테스트 없이 never-throws 약속이 깨진다.
    const expected = Buffer.from(hashHex, "hex");
    if (expected.length !== KEY_LEN) return false;
    const actual = scryptSync(password, Buffer.from(saltHex, "hex"), KEY_LEN);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

type Validated =
  | { ok: true; value: { name: string; password: string; msg: string } }
  | { ok: false; error: string };

export function validateEntry(input: {
  name: unknown;
  password: unknown;
  msg: unknown;
}): Validated {
  const { name, password, msg } = input;
  if (typeof name !== "string" || typeof password !== "string" || typeof msg !== "string") {
    return { ok: false, error: "입력 형식이 올바르지 않아요" };
  }
  // 비밀번호는 공백도 의미 있는 문자라 trim 하지 않는다.
  const n = name.trim();
  const m = msg.trim();
  if (!n) return { ok: false, error: "이름을 입력해 주세요" };
  if (n.length > NAME_MAX) return { ok: false, error: `이름은 ${NAME_MAX}자 이내로 입력해 주세요` };
  if (!m) return { ok: false, error: "축하 메시지를 입력해 주세요" };
  if (m.length > MSG_MAX) return { ok: false, error: `메시지는 ${MSG_MAX}자 이내로 입력해 주세요` };
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return { ok: false, error: `비밀번호는 ${PASSWORD_MIN}~${PASSWORD_MAX}자로 입력해 주세요` };
  }
  return { ok: true, value: { name: n, password, msg: m } };
}

// 서버 타임존에 상관없이 하객이 보는 날짜는 한국 날짜여야 한다.
// en-CA 로케일이 YYYY-MM-DD 를 준다.
const KST = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDate(d: Date): string {
  return KST.format(d).replaceAll("-", ".");
}
