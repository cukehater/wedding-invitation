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
