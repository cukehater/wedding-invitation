# 방명록 게시판 CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 메모리 더미로 동작하던 방명록을 Postgres 영속 저장으로 바꾸고, 등록·조회·삭제를 비밀번호 검증과 함께 실제로 동작하게 만든다.

**Architecture:** 비밀번호 해싱과 입력 검증 같은 순수 로직을 `lib/guestbook.ts` 로 분리해 `environment: "node"` vitest 로 TDD 한다. Next Route Handler 두 개가 DB 와 클라이언트 사이의 유일한 경계이고, DB 접근은 `lib/db.ts` 의 `@neondatabase/serverless` 클라이언트 한 곳으로 모은다. ORM·마이그레이션 도구는 쓰지 않는다 — 테이블이 하나다.

**Tech Stack:** Next.js 16.3.4 (App Router, Route Handlers, Node 런타임) · React 19.2.8 · Tailwind v4 · vitest 5 (`environment: "node"`) · Vercel Marketplace 의 **Neon Postgres** + `@neondatabase/serverless` · 해싱은 Node 내장 `node:crypto` scrypt

**Spec:** 별도 스펙 문서 없음. 요구사항은 사용자가 이 세션에서 직접 지정했다 — 저장소는 Vercel Postgres 계열, 범위는 **등록·조회·삭제**(수정 제외, 관리자 기능 제외). `README.md:44` 의 "방명록 백엔드 연동 — 현재 메모리 더미라 새로고침하면 초기화되고, 비밀번호는 입력만 받고 검증하지 않는다" 가 원래의 문제 기술이다. 스펙 문서가 없으므로 이 플랜의 판단은 잠정적이며, 충돌 시 사용자 지시가 우선한다.

## Global Constraints

- **새 런타임 의존성은 `@neondatabase/serverless` 하나만.** 이 저장소는 그동안 `next`/`react`/`react-dom` 3개만 유지해 왔고 이번에 처음 깬다. ORM(Prisma/Drizzle), 마이그레이션 CLI, 해싱 라이브러리(bcrypt/argon2), 밸리데이터(zod), 데이터 페칭 라이브러리(swr/react-query)는 **추가하지 않는다**. 해싱은 Node 내장 `node:crypto` 로 한다.
- **`@vercel/postgres` 를 쓰지 않는다.** Vercel Postgres 는 2024년 12월 Neon 으로 이관됐고 해당 패키지는 유지보수가 끝났다. 신규 코드는 `@neondatabase/serverless` 가 정식 경로다.
- **`vitest.config.ts` 를 수정하지 않는다.** `environment: "node"` 를 유지한다. 따라서 React 컴포넌트 테스트는 작성하지 않으며, 테스트 대상은 `lib/` 의 순수 함수뿐이다. Route Handler 와 컴포넌트는 각 Task 의 **수동 검증** 단계로 확인한다.
- **Route Handler 는 Node 런타임이어야 한다.** `node:crypto` 의 `scrypt` 는 Edge 런타임에 없다. 두 라우트 파일 모두 `export const runtime = "nodejs"` 를 명시한다.
- **비밀번호를 평문으로 저장·로그·응답하지 않는다.** DB 에는 해시만 들어가고, 어떤 API 응답에도 `password_hash` 가 포함되면 안 된다.
- **커밋은 이 저장소의 컨벤션을 따른다** (`.claude/skills/commit`): `라벨: 한글 서브젝트` **한 줄**. scope 괄호·본문·푸터·`Co-Authored-By` 전부 쓰지 않는다. 마침표 없이 명사형으로 끝낸다.
- 코드 스타일: 한글 주석은 "무엇"이 아니라 "왜" 를 적는다. Tailwind 는 arbitrary value 를 className 에 직접 쓴다. `next/image` 를 쓰지 않는다.
- 기존 UI 의 시각적 형태(카드 좌우 지그재그, `wfade` 진입 애니메이션, 40자 카운터, VIEW MORE)를 바꾸지 않는다. 이번 작업은 데이터 계층 교체이지 리디자인이 아니다.

## File Structure

| 파일 | 책임 | 상태 |
|---|---|---|
| `lib/guestbook.ts` | 비밀번호 해싱·검증, 입력 검증, 날짜 포맷, `Guest` 타입. 프레임워크·DB 비의존 순수 함수만. | **신규** |
| `lib/__tests__/guestbook.test.ts` | 위 순수 함수의 vitest(node) 테스트. | **신규** |
| `lib/db.ts` | Neon 클라이언트 단일 인스턴스. DB 접근은 전부 여기를 거친다. | **신규** |
| `db/schema.sql` | 테이블 DDL. 한 번 실행하는 용도이며 마이그레이션 도구를 쓰지 않는다는 결정의 기록. | **신규** |
| `app/api/guestbook/route.ts` | `GET`(목록), `POST`(등록). | **신규** |
| `app/api/guestbook/[id]/route.ts` | `DELETE`(비밀번호 확인 후 삭제). | **신규** |
| `components/GuestBook.tsx` | 목록 페칭, 등록 폼, 삭제 시 인라인 비밀번호 입력. | 수정 (대폭) |
| `lib/data.ts` | `SEED_GUESTS` 와 `Guest` 타입 제거. | 수정 (삭제만) |
| `.env.example` | 필요한 환경변수 이름 기록. | **신규** |
| `README.md` | 환경변수·DB 준비 절차, "남은 작업" 에서 방명록 항목 제거. | 수정 |

Task 1 은 DB 없이 완결되고, Task 2 는 DB 연결만, Task 3 은 HTTP 경계, Task 4 는 UI, Task 5 는 정리다. 각 Task 는 리뷰어가 독립적으로 거절할 수 있는 단위다.

---

### Task 1: 순수 로직 — 해싱 · 검증 · 날짜 포맷

**Files:**
- Create: `lib/guestbook.ts`
- Test: `lib/__tests__/guestbook.test.ts`

**Interfaces:**
- Consumes: 없음 (첫 Task, DB·네트워크 불필요)
- Produces:
  - `type Guest = { id: string; name: string; date: string; msg: string }`
  - `hashPassword(password: string): string` — `scrypt$<saltHex>$<hashHex>` 형식 문자열
  - `verifyPassword(password: string, stored: string): boolean` — 형식이 깨졌거나 길이가 달라도 throw 하지 않고 `false`
  - `validateEntry(input: { name: unknown; password: unknown; msg: unknown }): { ok: true; value: { name: string; password: string; msg: string } } | { ok: false; error: string }`
  - `formatDate(d: Date): string` — KST 기준 `YYYY.MM.DD`
  - 상수 `NAME_MAX = 20`, `MSG_MAX = 40`, `PASSWORD_MIN = 4`, `PASSWORD_MAX = 20`

**왜 이 파일이 따로 있는가:** `vitest.config.ts` 가 `environment: "node"` 라 DOM 이 없다. Route Handler 안에 로직을 두면 테스트할 방법이 없으므로, 검증 가치가 있는 부분을 프레임워크 비의존 함수로 빼낸다. `lib/autoplay.ts` 가 같은 이유로 같은 모양을 하고 있다.

- [ ] **Step 1: 실패하는 테스트 작성**

`lib/__tests__/guestbook.test.ts` 를 새로 만든다. 기존 `lib/__tests__/wedding.test.ts` 의 스타일(한글 `it` 설명, `@/` alias)을 따른다.

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "@/lib/guestbook"`. 기존 `wedding` / `autoplay` 테스트 10개는 계속 통과해야 한다.

- [ ] **Step 3: 최소 구현**

`lib/guestbook.ts` 를 새로 만든다.

```ts
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
```

- [ ] **Step 4: 통과 확인**

Run: `npm test`
Expected: PASS — `Test Files 3 passed (3)`, `Tests 27 passed (27)` (wedding 5 + autoplay 5 + guestbook 17). 출력에 기존 vitest `configLoader` 경고 외의 노이즈가 없어야 한다.

- [ ] **Step 5: 커밋**

```bash
git add lib/guestbook.ts lib/__tests__/guestbook.test.ts
git commit -m "feat: 방명록 비밀번호 해싱과 입력 검증 로직 추가"
```

---

### Task 2: DB 준비 — Neon 연결과 스키마

**Files:**
- Create: `lib/db.ts`
- Create: `db/schema.sql`
- Create: `.env.example`
- Modify: `package.json` (의존성 1개 추가)

**Interfaces:**
- Consumes: 없음
- Produces: `sql` — `lib/db.ts` 의 named export. `@neondatabase/serverless` 의 태그드 템플릿 쿼리 함수. Task 3 이 이것만 쓴다.

**사전 조건 — 사람이 해야 하는 일:** Vercel 대시보드에서 프로젝트 → Storage → Marketplace → **Neon** 을 연결한다. 연결하면 `DATABASE_URL` 이 프로젝트 환경변수로 자동 주입된다. 로컬 개발용으로는 Neon 콘솔의 connection string 을 `.env.local` 에 직접 넣는다. **이 값은 절대 커밋하지 않는다** — `.gitignore:34` 의 `.env*` 가 이미 막고 있다.

Vercel Postgres 는 2024년 12월 Neon 으로 이관됐고 `@vercel/postgres` 는 유지보수가 끝났다. 신규 코드는 `@neondatabase/serverless` 를 쓴다.

- [ ] **Step 1: 의존성 설치**

```bash
npm install @neondatabase/serverless
```

`package.json` 의 `dependencies` 가 `next`, `react`, `react-dom`, `@neondatabase/serverless` 4개가 되는지 확인한다. 다른 패키지가 같이 들어왔다면 되돌린다.

- [ ] **Step 2: 스키마 파일 작성**

`db/schema.sql` 을 새로 만든다.

```sql
-- 테이블이 하나뿐이라 마이그레이션 도구를 두지 않는다.
-- 스키마를 바꿀 일이 생기면 이 파일을 고치고 Neon 콘솔 SQL Editor 에서 직접 실행한다.
create table if not exists guestbook (
  id            bigserial    primary key,
  name          text         not null,
  msg           text         not null,
  password_hash text         not null,
  created_at    timestamptz  not null default now()
);

-- 목록은 항상 최신순 전체 조회라 정렬 인덱스만 있으면 된다.
create index if not exists guestbook_created_at_idx on guestbook (created_at desc);
```

- [ ] **Step 3: 스키마 적용**

Neon 콘솔의 SQL Editor 에 `db/schema.sql` 내용을 붙여 넣고 실행한다. 또는 psql 이 있다면:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

**시드 데이터를 넣지 않는다.** `lib/data.ts:76` 의 `SEED_GUESTS` 6건은 데모용 가짜 이름과 축하 메시지다. 실제 하객이 보는 페이지에 이걸 넣으면 오지 않은 사람이 축하한 것처럼 보인다. 빈 목록으로 시작하고, Task 4 에서 빈 상태 UI 를 만든다.

- [ ] **Step 4: 환경변수 예시 파일 작성**

`.env.example` 을 새로 만든다. 실제 값이 아니라 이름만 기록하는 파일이다.

```
# Neon Postgres (Vercel 대시보드에서 Storage -> Marketplace -> Neon 연결 시 자동 주입)
# 로컬 개발에서는 Neon 콘솔의 connection string 을 .env.local 에 직접 넣는다.
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# 카카오맵 JavaScript 앱키 (developers.kakao.com)
# 카카오맵 서비스 활성화 + 플랫폼 Web 에 배포 도메인 등록이 함께 필요하다.
NEXT_PUBLIC_KAKAO_MAP_KEY=
```

- [ ] **Step 5: DB 클라이언트 작성**

`lib/db.ts` 를 새로 만든다.

```ts
import { neon } from "@neondatabase/serverless";

// 연결 문자열이 없으면 라우트가 500 을 던지는 대신 여기서 바로 실패시킨다.
// 배포 시 환경변수 누락은 조용히 넘어가면 안 되는 종류의 사고다.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL 이 설정되지 않았습니다. .env.example 을 참고하세요.");

export const sql = neon(url);
```

- [ ] **Step 6: 연결 검증**

`.env.local` 에 `DATABASE_URL` 을 넣은 뒤 실행한다.

```bash
node --env-file=.env.local -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`select count(*)::int as n from guestbook\`.then(r => console.log('guestbook rows:', r[0].n));
"
```

Expected: `guestbook rows: 0`.
`relation "guestbook" does not exist` 가 나오면 Step 3 이 적용되지 않은 것이다. 연결 자체가 실패하면 connection string 끝에 `?sslmode=require` 가 있는지 확인한다.

- [ ] **Step 7: 커밋**

```bash
git add package.json package-lock.json lib/db.ts db/schema.sql .env.example
git commit -m "chore: Neon Postgres 연결과 방명록 스키마 추가"
```

---

### Task 3: API — 목록 · 등록 · 삭제

**Files:**
- Create: `app/api/guestbook/route.ts`
- Create: `app/api/guestbook/[id]/route.ts`

**Interfaces:**
- Consumes: `sql` (`lib/db.ts`), `Guest` / `hashPassword` / `verifyPassword` / `validateEntry` / `formatDate` (`lib/guestbook.ts`)
- Produces — Task 4 가 이 계약에만 의존한다:
  - `GET /api/guestbook` → `200 { guests: Guest[] }` (최신순)
  - `POST /api/guestbook` body `{ name, password, msg }` → `201 { guest: Guest }` | `400 { error: string }`
  - `DELETE /api/guestbook/<id>` body `{ password }` → `200 { ok: true }` | `403 { error }` | `404 { error }`
  - 모든 오류 응답의 `error` 는 그대로 토스트에 띄울 수 있는 한글 문장이다.

**런타임 주의:** `node:crypto` 의 `scryptSync` 는 Edge 런타임에 없다. 두 파일 모두 `export const runtime = "nodejs"` 를 반드시 넣는다. 빼먹으면 로컬에서는 동작하고 배포 후에만 깨질 수 있다.

- [ ] **Step 1: 목록·등록 라우트 작성**

`app/api/guestbook/route.ts` 를 새로 만든다.

```ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { type Guest, formatDate, hashPassword, validateEntry } from "@/lib/guestbook";

// scryptSync 가 Edge 런타임에 없다. 빼면 배포 후에만 깨진다.
export const runtime = "nodejs";
// 방명록은 매 요청 최신 목록이어야 한다. 빌드 시점에 캐시되면 안 된다.
export const dynamic = "force-dynamic";

// neon 드라이버는 timestamptz 를 문자열로 주기도 하고 Date 로 주기도 한다.
type Row = { id: string; name: string; msg: string; created_at: string | Date };

const toGuest = (r: Row): Guest => ({
  id: String(r.id),
  name: r.name,
  msg: r.msg,
  date: formatDate(new Date(r.created_at)),
});

export async function GET() {
  const rows = (await sql`
    select id, name, msg, created_at
    from guestbook
    order by created_at desc, id desc
  `) as Row[];
  return NextResponse.json({ guests: rows.map(toGuest) });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "요청을 읽을 수 없어요" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const parsed = validateEntry({ name: b.name, password: b.password, msg: b.msg });
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { name, password, msg } = parsed.value;
  const rows = (await sql`
    insert into guestbook (name, msg, password_hash)
    values (${name}, ${msg}, ${hashPassword(password)})
    returning id, name, msg, created_at
  `) as Row[];

  return NextResponse.json({ guest: toGuest(rows[0]) }, { status: 201 });
}
```

- [ ] **Step 2: 삭제 라우트 작성**

`app/api/guestbook/[id]/route.ts` 를 새로 만든다.

```ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { verifyPassword } from "@/lib/guestbook";

export const runtime = "nodejs";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // id 는 bigserial 이다. 숫자가 아니면 쿼리에 보내지 않고 바로 거른다.
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "메시지를 찾을 수 없어요" }, { status: 404 });
  }

  let password: unknown;
  try {
    password = ((await req.json()) as Record<string, unknown>)?.password;
  } catch {
    return NextResponse.json({ error: "요청을 읽을 수 없어요" }, { status: 400 });
  }
  if (typeof password !== "string") {
    return NextResponse.json({ error: "비밀번호를 입력해 주세요" }, { status: 400 });
  }

  const rows = (await sql`
    select password_hash from guestbook where id = ${id}
  `) as { password_hash: string }[];
  if (!rows[0]) {
    return NextResponse.json({ error: "메시지를 찾을 수 없어요" }, { status: 404 });
  }
  if (!verifyPassword(password, rows[0].password_hash)) {
    return NextResponse.json({ error: "비밀번호가 일치하지 않아요" }, { status: 403 });
  }

  await sql`delete from guestbook where id = ${id}`;
  return NextResponse.json({ ok: true });
}
```

`Promise<{ id: string }>` 는 Next.js 15 이상에서 동적 세그먼트 params 가 비동기가 된 결과다. 이 프로젝트는 16.3.4 이므로 `await` 가 필수다.

- [ ] **Step 3: 빌드 확인**

Run: `npm run build`
Expected: 타입 에러 0. 라우트 목록에 `ƒ /api/guestbook` 과 `ƒ /api/guestbook/[id]` 가 나타난다 (`ƒ` = Dynamic).

- [ ] **Step 4: 수동 검증 — 전체 경로를 curl 로 왕복**

`npm run dev` 를 띄운 뒤 순서대로 실행한다.

```bash
# 빈 목록
curl -s localhost:3000/api/guestbook
# 기대: {"guests":[]}

# 등록
curl -s -X POST localhost:3000/api/guestbook \
  -H 'content-type: application/json' \
  -d '{"name":"테스트","password":"1234","msg":"축하합니다"}'
# 기대: 201, {"guest":{"id":"1","name":"테스트","msg":"축하합니다","date":"2026.xx.xx"}}
# password_hash 가 응답에 없어야 한다.

# 검증 실패
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3000/api/guestbook \
  -H 'content-type: application/json' -d '{"name":"","password":"1234","msg":"축하"}'
# 기대: 400

curl -s -X POST localhost:3000/api/guestbook \
  -H 'content-type: application/json' -d '{"name":"홍길동","password":"12","msg":"축하"}'
# 기대: 400, {"error":"비밀번호는 4~20자로 입력해 주세요"}

# 틀린 비밀번호로 삭제
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE localhost:3000/api/guestbook/1 \
  -H 'content-type: application/json' -d '{"password":"9999"}'
# 기대: 403

# 없는 id
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE localhost:3000/api/guestbook/999999 \
  -H 'content-type: application/json' -d '{"password":"1234"}'
# 기대: 404

# 숫자가 아닌 id
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE localhost:3000/api/guestbook/abc \
  -H 'content-type: application/json' -d '{"password":"1234"}'
# 기대: 404

# 올바른 비밀번호로 삭제
curl -s -X DELETE localhost:3000/api/guestbook/1 \
  -H 'content-type: application/json' -d '{"password":"1234"}'
# 기대: {"ok":true}

curl -s localhost:3000/api/guestbook
# 기대: {"guests":[]}
```

각 명령의 실제 출력을 기록한다. 응답 어디에도 `password_hash` 나 평문 비밀번호가 없는지 눈으로 확인한다.

- [ ] **Step 5: 커밋**

```bash
git add app/api/guestbook
git commit -m "feat: 방명록 목록·등록·삭제 API 추가"
```

---

### Task 4: 화면 연결 — GuestBook 컴포넌트

**Files:**
- Modify: `components/GuestBook.tsx` (전면 수정)

**Interfaces:**
- Consumes: Task 3 의 세 엔드포인트, `Guest` 타입 (`lib/guestbook.ts`), `useToast` (`components/Toast.tsx`, 시그니처 `(msg: string) => void`)
- Produces: 없음 (최종 소비자)

**지켜야 할 것:** 카드 좌우 지그재그(`i % 2`), `wfade` 진입 애니메이션, 40자 카운터, VIEW MORE(4개 초과 시), 입력 필드의 `FIELD` 클래스, SEND MESSAGE 버튼의 활성/비활성 인라인 스타일 — 전부 현재 모양 그대로 유지한다. 바뀌는 것은 데이터 출처와 삭제 흐름뿐이다.

**새로 생기는 것 셋:**
1. 첫 렌더에 `GET` 으로 목록을 불러온다. 로딩 중에는 목록 자리를 비워 둔다(스피너를 추가하지 않는다 — 기존 페이지에 스피너 패턴이 없다).
2. 목록이 비면 안내 문구를 보여준다. 시드 데이터를 넣지 않기로 했으므로 실제로 자주 보게 되는 상태다.
3. 삭제 버튼을 누르면 그 카드 안에 비밀번호 입력 줄이 펼쳐진다. `window.confirm` / `window.prompt` 를 쓰지 않는다 — 카카오톡 인앱 브라우저에서 동작이 불안정하고 디자인과 맞지 않는다.

- [ ] **Step 1: 컴포넌트 전면 교체**

`components/GuestBook.tsx` 의 내용을 아래로 완전히 교체한다.

```tsx
"use client";
import { useEffect, useState } from "react";
import { SectionHeading } from "./SectionHeading";
import type { Guest } from "@/lib/guestbook";
import { useToast } from "./Toast";

const FIELD =
  "h-11 w-full border-0 border-b border-[#E7E1DE] bg-transparent px-0.5 font-body text-[13px] " +
  "text-[#3A3330] outline-none transition-colors duration-250 focus:border-b-[#2E2A27]";

export function GuestBook({ revealRef }: { revealRef: (n: HTMLElement | null) => void }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  // 삭제 확인 중인 카드의 id 와 그 입력값. 한 번에 하나만 열린다.
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletePw, setDeletePw] = useState("");
  const say = useToast();

  useEffect(() => {
    let alive = true;
    fetch("/api/guestbook")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load failed"))))
      .then((d: { guests: Guest[] }) => alive && setGuests(d.guests))
      .catch(() => alive && say("방명록을 불러오지 못했어요"))
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [say]);

  const ready = Boolean(name.trim() && pw.trim() && msg.trim()) && !sending;
  const visible = showAll ? guests : guests.slice(0, 4);

  const submit = async () => {
    if (!ready) return say("이름 · 비밀번호 · 메시지를 모두 입력해 주세요");
    setSending(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), password: pw, msg: msg.trim() }),
      });
      const data = await res.json();
      if (!res.ok) return say(data.error ?? "등록하지 못했어요");
      setGuests((g) => [data.guest as Guest, ...g]);
      setName(""); setPw(""); setMsg("");
      say("축하 메시지가 등록되었어요");
    } catch {
      say("등록하지 못했어요");
    } finally {
      setSending(false);
    }
  };

  const confirmDelete = async (id: string) => {
    if (!deletePw) return say("비밀번호를 입력해 주세요");
    try {
      const res = await fetch(`/api/guestbook/${id}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: deletePw }),
      });
      const data = await res.json();
      if (!res.ok) return say(data.error ?? "삭제하지 못했어요");
      setGuests((g) => g.filter((x) => x.id !== id));
      setDeleting(null);
      setDeletePw("");
      say("메시지를 삭제했어요");
    } catch {
      say("삭제하지 못했어요");
    }
  };

  const openDelete = (id: string) => {
    setDeleting((cur) => (cur === id ? null : id));
    setDeletePw("");
  };

  return (
    <section ref={revealRef} className="px-5 pt-11 pb-14">
      <SectionHeading title="GUEST BOOK" />
      <p className="m-0 text-center font-body text-[13.5px] leading-[1.95] text-[#6B6360]">
        신랑신부에게 축하메시지를 남겨주세요 <span className="text-[#FF9A42]">♡</span>
      </p>

      <div className="mt-[26px] grid grid-cols-2 gap-4">
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder="이름" className={FIELD} />
        <input value={pw} onChange={(e) => setPw(e.target.value.slice(0, 20))} type="password" placeholder="비밀번호" className={FIELD} />
      </div>

      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value.slice(0, 40))}
        rows={3}
        placeholder="축하 메시지를 남겨주세요 (40자 이내)"
        className="mt-5 min-h-[84px] w-full resize-none border-0 border-b border-[#E7E1DE] bg-transparent
          px-0.5 py-1.5 font-body text-[13px] leading-[1.8] text-[#3A3330] outline-none
          transition-colors duration-250 focus:border-b-[#2E2A27]"
      />
      <div className="mt-[7px] text-right font-heading text-[10px] tracking-[.08em] text-[#B8B0AA]">
        {msg.length} / 40
      </div>

      <button
        onClick={submit}
        disabled={sending}
        style={{
          cursor: ready ? "pointer" : "not-allowed",
          background: ready ? "#2E2A27" : "transparent",
          color: ready ? "#FFFFFF" : "#BDB5B0",
          borderColor: ready ? "#2E2A27" : "#E7E1DE",
        }}
        className="mt-5 flex h-12 w-full appearance-none items-center justify-center border
          font-heading text-[11.5px] tracking-[.16em] transition-all duration-250"
      >
        {sending ? "SENDING..." : "SEND MESSAGE"}
      </button>

      {loaded && guests.length === 0 && (
        <p className="mt-[34px] mb-0 text-center font-body text-[13px] leading-[1.9] text-[#B8B0AA]">
          아직 남겨진 메시지가 없어요.<br />첫 축하를 남겨주세요 :)
        </p>
      )}

      <div className="mt-[34px] grid gap-4">
        {visible.map((g, i) => (
          <div key={g.id} className="flex" style={{ justifyContent: i % 2 ? "flex-end" : "flex-start" }}>
            <div className="w-[82%] animate-[wfade_.5s_ease_both] rounded-[26px] border border-[#EFE9EA]
              bg-[#FDFCFC] px-6 py-[22px] shadow-[0_2px_8px_rgba(0,0,0,.03)]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12.5px] text-[#7A7A7A]">{g.name}</span>
                <span className="flex items-center gap-[5px]">
                  <span className="text-[10.5px] text-[#C4BCB6]">{g.date}</span>
                  <button onClick={() => openDelete(g.id)} aria-label="삭제"
                    aria-expanded={deleting === g.id}
                    className="flex h-5 w-5 cursor-pointer appearance-none items-center justify-center
                      text-[#C4BCB6] transition-colors hover:text-[#8A8079]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 21 6" /><path d="M8 6V4h8v2" />
                      <path d="M6 6l1 14h10l1-14" /><path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </span>
              </div>
              <p className="mt-2.5 mb-0 text-[15px] leading-[1.8] break-words text-[#4A4A4A] text-pretty">
                {g.msg}
              </p>

              {deleting === g.id && (
                <div className="mt-3 flex animate-[wfade_.25s_ease_both] items-center gap-2 border-t border-[#F1ECEC] pt-3">
                  <input
                    value={deletePw}
                    onChange={(e) => setDeletePw(e.target.value.slice(0, 20))}
                    onKeyDown={(e) => e.key === "Enter" && confirmDelete(g.id)}
                    type="password"
                    placeholder="비밀번호"
                    autoFocus
                    className="h-8 min-w-0 flex-1 border-0 border-b border-[#E7E1DE] bg-transparent px-0.5
                      font-body text-[12.5px] text-[#3A3330] outline-none focus:border-b-[#2E2A27]"
                  />
                  <button onClick={() => confirmDelete(g.id)}
                    className="h-8 shrink-0 cursor-pointer appearance-none rounded-[99px] bg-[#2E2A27] px-3
                      font-heading text-[10.5px] tracking-[.1em] text-white">
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!showAll && guests.length > 4 && (
        <div className="mt-6 flex justify-center">
          <button onClick={() => setShowAll(true)}
            className="cursor-pointer appearance-none border-b border-[#DED8D6] px-0.5 py-1
              font-heading text-[11.5px] tracking-[.16em] text-[#6B6360] transition-colors
              hover:border-[#2E2A27] hover:text-[#2E2A27]">
            VIEW MORE
          </button>
        </div>
      )}
    </section>
  );
}
```

제거된 것: `SEED_GUESTS` import, `lib/data` 의 `Guest` import, `p2` 헬퍼(날짜는 이제 서버가 만든다).

- [ ] **Step 2: 빌드·테스트 확인**

```bash
npm run build
npm test
```
Expected: 빌드 타입 에러 0. `Test Files 3 passed (3)` / `Tests 27 passed (27)` 유지.

- [ ] **Step 3: 수동 검증 — 브라우저 왕복**

`npm run dev` 후 `http://localhost:3000` 의 GUEST BOOK 섹션에서 확인한다.

1. 처음에는 "아직 남겨진 메시지가 없어요" 가 보인다.
2. 이름·비밀번호·메시지를 넣고 SEND MESSAGE → 카드가 즉시 목록 맨 위에 붙고 "축하 메시지가 등록되었어요" 토스트가 뜬다. 입력 필드 3개가 비워진다.
3. **새로고침해도 카드가 남아 있다.** 이 한 가지가 이번 작업 전체의 핵심이다.
4. 비밀번호를 2자만 넣고 전송 → "비밀번호는 4~20자로 입력해 주세요" 토스트.
5. 카드의 휴지통 아이콘 → 카드 안에 비밀번호 줄이 펼쳐진다. 다시 누르면 접힌다.
6. 틀린 비밀번호로 삭제 → "비밀번호가 일치하지 않아요", 카드는 그대로.
7. 맞는 비밀번호로 삭제 → 카드가 사라지고 "메시지를 삭제했어요".
8. 5개 이상 등록 → 4개만 보이고 VIEW MORE 가 나타난다. 누르면 전부 보인다.
9. 카드 좌우 지그재그 배치가 유지된다.
10. devtools Network 에서 `/api/guestbook` 응답에 `password_hash` 가 없는지 확인한다.

- [ ] **Step 4: 커밋**

```bash
git add components/GuestBook.tsx
git commit -m "feat: 방명록을 API 연동으로 교체하고 삭제 시 비밀번호 확인 추가"
```

---

### Task 5: 정리 — 더미 데이터 제거와 문서 갱신

**Files:**
- Modify: `lib/data.ts` (`Guest` 타입과 `SEED_GUESTS` 제거)
- Modify: `README.md`

**Interfaces:**
- Consumes: Task 4 가 `lib/data` 의 방명록 관련 export 를 더 이상 쓰지 않는 상태
- Produces: 없음

- [ ] **Step 1: 더미 데이터 제거**

`lib/data.ts:73` 의 `export type Guest = ...` 한 줄과 `:76` 부터 시작하는 `export const SEED_GUESTS: Guest[] = [ ... ];` 블록 전체를 삭제한다. `Guest` 타입은 이제 `lib/guestbook.ts` 가 소유한다.

지운 뒤 참조가 남지 않았는지 확인한다.

```bash
grep -rn "SEED_GUESTS" app components lib
grep -rn 'from "@/lib/data"' app components lib
```

첫 번째는 결과가 0줄이어야 한다. 두 번째에 남은 import 들이 `Guest` 를 가져오고 있지 않은지 확인한다.

- [ ] **Step 2: README 갱신**

`README.md` 를 세 군데 고친다.

1. "남은 작업" 목록에서 방명록 항목(`방명록 백엔드 연동 — 현재 메모리 더미라 새로고침하면 초기화되고, 비밀번호는 입력만 받고 검증하지 않는다.`)을 삭제한다.
2. `npm test` 설명에 방명록 테스트가 포함됐음을 반영한다. 현재 "카운트다운 / 달력 단위 테스트" 로 적혀 있는 문장에 방명록 해싱·검증을 추가한다.
3. 실행에 필요한 환경변수 섹션을 추가한다. 위치는 "남은 작업" 바로 위.

```markdown
## 환경변수

`.env.example` 을 `.env.local` 로 복사해 값을 채운다. `.env*` 는 `.gitignore` 에 걸려 있다.

| 이름 | 용도 |
|---|---|
| `DATABASE_URL` | 방명록 저장용 Neon Postgres 연결 문자열. Vercel 에서 Storage → Marketplace → Neon 을 연결하면 자동 주입된다. |
| `NEXT_PUBLIC_KAKAO_MAP_KEY` | 카카오맵 JavaScript 앱키. |

처음 배포할 때 두 가지를 잊기 쉽다.

- DB 테이블은 자동 생성되지 않는다. Neon 콘솔 SQL Editor 에서 `db/schema.sql` 을 한 번 실행해야 한다.
- 카카오맵은 앱키만으로 부족하다. [카카오 개발자 콘솔](https://developers.kakao.com)에서 **카카오맵 서비스 활성화**와 **플랫폼 → Web 에 배포 도메인 등록** 을 같이 해야 한다. 둘 중 하나라도 빠지면 로컬에서는 멀쩡하고 프로덕션에서만 지도가 폴백 문구로 바뀐다.
```

- [ ] **Step 3: 최종 확인**

```bash
npm run build
npm test
```
Expected: 빌드 타입 에러 0, `Test Files 3 passed (3)` / `Tests 27 passed (27)`.

- [ ] **Step 4: 커밋**

```bash
git add lib/data.ts README.md
git commit -m "chore: 방명록 더미 데이터 제거와 환경변수 문서 정리"
```

---

## 최종 검증

5개 Task 를 모두 마친 뒤 한 번에 확인한다.

- [ ] **의존성이 4개인지**

```bash
node -e "console.log(Object.keys(require('./package.json').dependencies))"
```
Expected: `[ 'next', 'react', 'react-dom', '@neondatabase/serverless' ]` (순서는 무관). ORM·해싱 라이브러리·zod·swr 이 섞여 들어왔다면 되돌린다.

- [ ] **Edge 런타임으로 새지 않았는지**

```bash
grep -rn 'export const runtime' app/api
```
Expected: 두 파일 모두 `"nodejs"`.

- [ ] **비밀번호가 새지 않는지**

```bash
grep -rn 'password_hash' app components
```
Expected: `app/api/guestbook/[id]/route.ts` 의 select 문과 `app/api/guestbook/route.ts` 의 insert 문에만 등장한다. `components/` 에는 0건.

- [ ] **전체 빌드·테스트**

```bash
npm run build && npm test
```

- [ ] **엔드투엔드**

`npm run dev` 후 모바일 폭(375px)에서 등록 → 새로고침 → 삭제 순서로 한 번 더 왕복한다. 새로고침 후에도 메시지가 남아 있는지가 이 작업의 완료 조건이다.

## 이번 범위에서 의도적으로 뺀 것

각각 왜 뺐는지와 언제 필요해지는지를 적는다. 나중에 "빠뜨린 것" 과 "안 하기로 한 것" 을 구분하기 위해서다.

- **수정(Update).** 사용자가 등록·조회·삭제로 범위를 정했다. 40자 축하 문구는 지우고 다시 쓰는 편이 빠르다.
- **관리자 일괄 삭제.** 스팸이 실제로 오면 그때 넣는다. 지금은 Neon 콘솔에서 직접 `delete` 하면 된다.
- **rate limit.** 공개 엔드포인트라 이론상 도배가 가능하지만, 하객 수십 명이 며칠간 쓰는 페이지다. 도배가 실제로 발생하면 Vercel 의 WAF 나 IP 기준 제한을 검토한다. 입력 길이 상한(이름 20자·메시지 40자)은 서버에서 이미 강제하므로 한 번에 넣을 수 있는 양은 제한돼 있다.
- **페이지네이션.** `GET` 이 전체를 반환한다. 40자 × 수백 건이면 수십 KB 수준이다. 수천 건이 되면 `limit`/`offset` 을 넣는다.
- **낙관적 UI.** 등록·삭제 모두 서버 응답을 기다린 뒤 목록을 바꾼다. 응답이 느려 답답하다는 피드백이 나오면 그때 바꾼다.
- **컴포넌트 테스트.** `vitest.config.ts` 가 `environment: "node"` 다. jsdom 과 testing-library 를 추가하지 않기로 한 기존 결정을 유지한다.
