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
