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
