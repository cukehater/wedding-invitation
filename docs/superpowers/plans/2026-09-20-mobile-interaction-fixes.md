# 모바일 인터랙션 복구 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카카오톡 인앱 브라우저에서 갤러리 스와이프와 버튼 탭이 동작하지 않는 문제를 진단 가능한 상태로 만들고, 원인 후보로 확인된 결함들을 제거한다.

**Architecture:** 원인이 로컬에서 재현되지 않으므로 두 갈래로 간다. Task 1 은 인앱 브라우저에서 JS 가 살아 있는지를 눈으로 알 수 있게 만드는 진단 장치이고(devtools 가 없는 환경에서 유일한 관측 수단), Task 2~4 는 재현 여부와 무관하게 확실히 결함인 것들을 고친다. Task 1 의 결과가 나오면 남은 범위가 결정된다.

**Tech Stack:** Next.js 16.3.4 · React 19.2.8 · Tailwind v4 · 대상 환경은 카카오톡 인앱 브라우저(iOS = WKWebView, Android = Chrome WebView)

**Spec:** 스펙 문서 없음. 사용자 보고가 원 증상이다 — "카카오톡 인앱 브라우저에서 갤러리 카드 스와이프와 버튼 탭이 안 먹힌다". 추가 근거는 `docs/superpowers/plans/2026-09-20-todo-8-items.md` 실행 후의 전체 브랜치 리뷰 지적 5건 중 3건이 이 영역과 겹친다.

## Global Constraints

- **새 런타임 의존성 0.** `dependencies` 는 `next`, `react`, `react-dom`, `@neondatabase/serverless` 4개를 유지한다.
- **`vitest.config.ts` 를 수정하지 않는다** (`environment: "node"`). 이 플랜의 변경은 전부 브라우저 동작이라 단위 테스트 대상이 아니다. 검증은 각 Task 의 수동 확인 단계로 한다.
- 커밋 컨벤션(`.claude/skills/commit`): `라벨: 한글 서브젝트` **한 줄**. scope 괄호·본문·푸터·`Co-Authored-By` 전부 금지.
- 카드 기준 폭 430px, `--card-zoom` / `--card-w` 는 `app/globals.css` 의 `:root` 에만 둔다.
- 한글 주석은 "왜" 를 쓴다. **근거 없는 단정을 주석에 쓰지 않는다** — 이 플랜이 존재하는 이유 중 하나가 그런 주석이었다.

## 조사 결과 — 증거로 배제한 것

로컬 Chromium(헤드리스 + CDP 터치 에뮬레이션)으로 확인했고, 아래는 **원인이 아니다**.

| 가설 | 확인 방법 | 결과 |
|---|---|---|
| `<div onClick>` 이 iOS 에서 클릭 안 되는 문제 | `onClick` 요소 전수 검사 | 전부 `cursor-pointer` 이거나 실제 `<button>` — 해당 없음 |
| `zoom` 히트 테스트 어긋남 | 뷰포트 390px(zoom=1) / 560px(zoom=1.16)에서 `elementFromPoint` 와 실제 탭 비교 | 양쪽 모두 버튼을 정확히 반환하고 아코디언이 열림 — Blink 에서는 정상 |
| `touch-action: pan-y` 가 스와이프를 끊음 | 대각선 터치 드래그 10스텝 + `pointercancel` 계측 | `cancelable: true`, `pointercancel` 0건, 카드 transform 정상 적용 |

**단, 위 셋 다 Chromium 에서만 배제됐다.** 카카오톡 iOS 는 WKWebView 이고 이 머신에 WebKit 이 없다. `zoom` 은 비표준이라 WebKit 의 히트 테스트 동작이 Blink 와 다를 수 있다.

## 조사 결과 — 확실한 결함

| # | 위치 | 문제 |
|---|---|---|
| A | `app/globals.css` 의 `touch-action: pan-y` 주석 | "가로 스와이프 UI 가 없어서 안전하다" 가 **거짓**이다. `hooks/useSwipeStack.ts:102-105` 가 정확히 그 UI 다. 당시 grep 패턴이 `onPointer` 여서 `addEventListener("pointerdown")` 을 놓쳤다. 값(`pan-y`) 자체는 훅의 축 판정 로직과 우연히 일치해 맞지만, 근거가 틀렸다. |
| B | `components/KakaoMap.tsx` 지도 컨테이너 | 지도는 양축 제스처를 모두 소유해야 하는데 body 의 `pan-y` 를 물려받아 세로 드래그를 페이지 스크롤에 뺏긴다. |
| C | `app/globals.css` 의 reduced-motion 블록 | `warrow` 키프레임이 화살표의 유일한 수직 정렬(`translateY(-50%)`)을 들고 있는데 reduced-motion 이 애니메이션을 통째로 꺼서 20px 어긋난다. |
| D | `components/BgmToggle.tsx` | `armAutoplay` 가 `window` 의 `pointerdown` 을 듣고, 토글 버튼의 `pointerdown` 도 거기로 버블링된다. 페이지 첫 동작이 토글 탭이면 autoplay 가 먼저 켜고 뒤이은 `click` 이 `on === true` 를 읽어 "껐어요" 를 띄운다. |
| E | `components/Account.tsx` | 클립보드 실패 시 "길게 눌러 직접 복사" 를 안내하는데 body 의 `user-select: none` 이 그 동작을 막았다. 카카오톡 인앱 브라우저는 클립보드 API 가 막히는 대표적 환경이라 실제로 밟는 경로다. |

## 가장 유력한 가설 — 하이드레이션 실패

스와이프(`addEventListener` 포인터 드래그)와 버튼 탭(React `onClick`)은 구현이 완전히 다르다. **둘이 동시에 죽는 원인은 보통 CSS 가 아니라 클라이언트 JS 가 통째로 죽은 것**이다. Next 가 HTML 을 프리렌더하므로 화면은 정상으로 보이고 인터랙션만 전부 사라진다. Task 1 이 이 가설을 참/거짓으로 가른다.

카나리아는 이미 페이지에 있다 — `components/WeddingDate.tsx:22-29` 의 카운트다운은 `useEffect` 가 돌기 전까지 `--` 를 보여준다. 인앱 브라우저에서 `--` 로 멈춰 있으면 하이드레이션이 죽은 것이고, 숫자가 1초씩 줄어들면 JS 는 살아 있으므로 원인은 CSS/제스처 쪽으로 좁혀진다.

---

### Task 1: 인앱 브라우저용 오류 표면

**Files:**
- Create: `components/DebugOverlay.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: 없음
- Produces: `<DebugOverlay />` — `?debug=1` 쿼리가 있을 때만 렌더되는 클라이언트 컴포넌트

카카오톡 인앱 브라우저에는 devtools 가 없다. 하이드레이션이 죽었는지, 어떤 오류로 죽었는지 알 방법이 현재 전혀 없다. 이 Task 는 그 관측 수단을 만든다. **`?debug=1` 이 없으면 아무것도 렌더하지 않으므로 하객에게는 보이지 않는다.**

- [ ] **Step 1: 오버레이 컴포넌트 작성**

`components/DebugOverlay.tsx` 를 새로 만든다.

```tsx
"use client";
import { useEffect, useState } from "react";

// 인앱 브라우저에는 devtools 가 없다. ?debug=1 일 때만 켜지는 관측 장치다.
export function DebugOverlay() {
  const [on, setOn] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!new URLSearchParams(location.search).has("debug")) return;
    setOn(true);
    const push = (s: string) => setLines((l) => [...l.slice(-19), s]);
    push(`hydrated ok · ${navigator.userAgent.slice(0, 60)}`);
    push(`vw=${innerWidth} dpr=${devicePixelRatio} touch=${navigator.maxTouchPoints}`);
    push(`card-zoom=${getComputedStyle(document.documentElement).getPropertyValue("--card-zoom").trim()}`);
    push(`body touch-action=${getComputedStyle(document.body).touchAction}`);

    const onErr = (e: ErrorEvent) => push(`ERROR ${e.message} @${e.filename?.split("/").pop()}:${e.lineno}`);
    const onRej = (e: PromiseRejectionEvent) => push(`REJECT ${String(e.reason).slice(0, 120)}`);
    addEventListener("error", onErr);
    addEventListener("unhandledrejection", onRej);
    return () => {
      removeEventListener("error", onErr);
      removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  if (!on) return null;
  return (
    <div
      style={{ pointerEvents: "none" }}
      className="fixed inset-x-0 bottom-0 z-[999] max-h-[38vh] overflow-auto bg-[rgba(0,0,0,.82)] p-2
        font-mono text-[10px] leading-[1.5] break-all text-[#8FE388]"
    >
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 레이아웃에 연결**

`app/layout.tsx` 의 `<ToastProvider>{children}</ToastProvider>` 를 아래로 바꾼다.

```tsx
        <ToastProvider>{children}</ToastProvider>
        <DebugOverlay />
```

그리고 import 를 추가한다: `import { DebugOverlay } from "@/components/DebugOverlay";`

- [ ] **Step 3: 빌드·테스트**

```bash
npm run build
npm test
```
Expected: 타입 에러 0, `Test Files 3 passed (3)` / `Tests 27 passed (27)`.

- [ ] **Step 4: 로컬 확인**

`npm run dev` 후 `http://localhost:3000` 에는 오버레이가 **없어야** 하고, `http://localhost:3000/?debug=1` 에는 검은 로그 박스가 뜨면서 `hydrated ok` 줄이 보여야 한다.

- [ ] **Step 5: 커밋**

```bash
git add components/DebugOverlay.tsx app/layout.tsx
git commit -m "feat: 인앱 브라우저 진단용 debug 오버레이 추가"
```

- [ ] **Step 6: 배포 후 실기기 확인 — 사람이 해야 하는 일**

배포한 뒤 카카오톡으로 `<배포주소>/?debug=1` 을 열고 다음을 기록한다.

1. `hydrated ok` 줄이 보이는가? **안 보이면 하이드레이션이 죽은 것이고 이것이 근본 원인이다.**
2. `ERROR` / `REJECT` 줄이 있는가? 있으면 그 메시지 전문.
3. `vw=`, `card-zoom=`, `body touch-action=` 값.
4. WEDDING DATE 의 카운트다운이 숫자인가 `--` 인가.

이 네 가지가 남은 작업의 범위를 결정한다. `hydrated ok` 가 보이고 카운트다운이 돈다면 원인은 제스처/CSS 쪽이고, 안 보이면 Task 2~4 는 증상과 무관한 별개 수정이 된다.

---

### Task 2: 지도 제스처 소유권 (결함 B)

**Files:**
- Modify: `components/KakaoMap.tsx`
- Modify: `app/globals.css` (주석만, 결함 A)

**Interfaces:**
- Consumes: 없음
- Produces: 없음

- [ ] **Step 1: 지도 컨테이너에 `touch-action: none`**

`components/KakaoMap.tsx` 의 성공 컨테이너와 실패 폴백 `<div>` 양쪽 className 에 `touch-action-none` 을 추가한다. Tailwind v4 는 `touch-action: none` 을 `touch-none` 유틸리티로 제공한다.

성공 컨테이너:
```tsx
  return <div ref={box} role="img" aria-label={`${VENUE.name} 지도`} className="aspect-video w-full touch-none" />;
```

실패 폴백도 같은 `touch-none` 을 붙인다 — 폴백일 때는 제스처가 필요 없지만, 두 상태의 박스 속성이 갈라지면 나중에 한쪽만 고치게 된다.

`touch-action` 은 히트된 요소에서 조상 방향으로 교집합을 취하므로, body 의 `pan-y` 보다 더 제한적인 `none` 은 정상 적용된다. 지도 위에서는 페이지가 스크롤되지 않는데, 이는 지도 위젯의 표준 동작이고 지도 높이가 `aspect-video` 로 제한돼 있어 하객이 갇히지 않는다.

- [ ] **Step 2: 거짓 주석 정정 (결함 A)**

`app/globals.css` 의 `touch-action: pan-y` 위 주석에서 "가로 스와이프 UI 가 없어서 안전하다" 문장을 지우고 사실로 대체한다.

```css
    /* iOS Safari 는 viewport 의 user-scalable=no 를 무시한다. pan-y 로 세로 스크롤만 남기고
       핀치 줌과 더블탭 줌을 막는다.
       hooks/useSwipeStack.ts 의 갤러리 카드 스와이프는 pan-y 와 호환된다 — 훅이 축을 판정해
       세로 드래그면 preventDefault 를 하지 않고 브라우저 스크롤에 넘긴다.
       반대로 양축을 모두 소유해야 하는 요소(지도)는 자기 자신에게 touch-action: none 을 건다. */
    touch-action: pan-y;
```

- [ ] **Step 3: 빌드**

```bash
npm run build
```
Expected: 타입 에러 0.

- [ ] **Step 4: 수동 확인**

`npm run dev` 후 dev 서버 HTML 에 지도 컨테이너가 `touch-none` 클래스를 갖는지 확인한다.

```bash
curl -s localhost:3000 | grep -o 'aspect-video[^"]*'
```
Expected: `touch-none` 포함.

브라우저 육안 확인은 데스크톱에서 의미가 없다(마우스 드래그는 `touch-action` 과 무관). 실기기 확인은 Task 1 Step 6 과 같이 한다.

- [ ] **Step 5: 커밋**

```bash
git add components/KakaoMap.tsx app/globals.css
git commit -m "fix: 지도에 touch-action none 을 주어 드래그가 페이지 스크롤에 뺏기지 않게 수정"
```

---

### Task 3: BGM 토글 첫 탭 레이스 (결함 D)

**Files:**
- Modify: `components/BgmToggle.tsx`

**Interfaces:**
- Consumes: `armAutoplay` (`lib/autoplay.ts`)
- Produces: 없음

첫 방문자가 페이지에서 가장 먼저 하는 동작이 토글 탭이면, `pointerdown` 이 `window` 로 버블링돼 autoplay 콜백이 먼저 재생을 시작하고 `setOn(true)` 를 한다. 수십 ms 뒤 `click` 이 도착해 `toggle` 이 React state `on` 을 읽는데 이미 `true` 라 일시정지 분기로 들어가 "배경음악을 껐어요" 를 띄운다. 켜려고 누른 사람에게 꺼졌다고 알린다. 오디오가 캐시된 재방문에서 잘 재현된다.

고치는 방법은 **진실의 원천을 React state 에서 DOM 으로 옮기는 것**이다. `el.paused` 는 autoplay·`onEnded`·수동 토글 어느 경로로 바뀌든 항상 실제 재생 상태를 말한다.

- [ ] **Step 1: `toggle` 이 `el.paused` 로 분기하게 수정**

`components/BgmToggle.tsx` 의 `toggle` 함수를 아래로 교체한다.

```tsx
  const toggle = async () => {
    const el = audio.current;
    if (!el) return;
    // React state 는 autoplay 콜백과 경쟁한다. 실제 재생 여부는 DOM 만 안다.
    if (!el.paused) { el.pause(); setOn(false); say("배경음악을 껐어요"); return; }
    try {
      await play();
      say("배경음악을 켰어요");
    } catch {
      say("배경음악을 재생할 수 없어요");
    }
  };
```

`on` state 는 이퀄라이저 막대 애니메이션 표시용으로 계속 쓰이므로 제거하지 않는다. 바뀌는 것은 분기 조건 하나뿐이다.

- [ ] **Step 2: 빌드·테스트**

```bash
npm run build
npm test
```
Expected: 타입 에러 0, `Test Files 3 passed (3)` / `Tests 27 passed (27)`.

- [ ] **Step 3: 수동 확인**

`npm run dev` 후 브라우저에서:
1. 페이지를 새로고침하고 **가장 먼저 BGM 토글을 클릭**한다.
2. 기대: 음악이 켜지고 "배경음악을 켰어요" 토스트. "껐어요" 가 뜨면 수정이 안 된 것이다.
3. 한 번 더 클릭 → 꺼지고 "껐어요".
4. 새로고침 후 아무 데나 클릭(자동재생) → 토글 라벨이 ON 으로 바뀐다. 그 상태에서 토글 클릭 → "껐어요".

- [ ] **Step 4: 커밋**

```bash
git add components/BgmToggle.tsx
git commit -m "fix: 배경음악 토글이 첫 탭에서 즉시 꺼지던 경쟁 상태 수정"
```

---

### Task 4: reduced-motion 정렬과 계좌 복사 폴백 (결함 C, E)

**Files:**
- Modify: `app/globals.css`
- Modify: `components/Account.tsx`

**Interfaces:**
- Consumes: 없음
- Produces: 없음

- [ ] **Step 1: reduced-motion 에서 화살표 정렬 유지 (결함 C)**

`app/globals.css` 의 `@media (prefers-reduced-motion: reduce)` 블록에서 `warrow` 를 나머지와 분리한다. `warrow` 키프레임이 `translateY(-50%)` 를 들고 있어서 애니메이션만 끄면 정렬까지 사라진다.

```css
@media (prefers-reduced-motion: reduce) {
  [class*="wheart"],
  [class*="wday"],
  [class*="wspin"],
  [class*="wpulse"] {
    animation: none !important;
  }
  /* warrow 는 키프레임이 수직 정렬(translateY(-50%))까지 들고 있어서
     animation 만 끄면 화살표가 20px 내려앉아 "this day!" 와 겹친다. */
  [class*="warrow"] {
    animation: none !important;
    transform: translate(0, -50%) !important;
  }
}
```

- [ ] **Step 2: 계좌번호를 선택 가능하게 (결함 E)**

`components/Account.tsx` 에서 계좌번호를 표시하는 `<span>` 에 `select-text` 를 추가한다. body 의 `user-select: none` 때문에 "길게 눌러 직접 복사해 주세요" 안내가 실행 불가능한 상태다. 카카오톡 인앱 브라우저는 클립보드 API 가 막히는 대표 환경이라 실제로 밟는 경로다.

계좌번호 텍스트를 담은 `<span>` 의 className 에 `select-text` 를 덧붙인다. 버튼 전체가 아니라 계좌번호 문자열만 선택 가능하게 한다 — 버튼 전체를 풀면 탭할 때 텍스트 선택이 먼저 걸려 복사 버튼이 눌리지 않는다.

- [ ] **Step 3: 빌드**

```bash
npm run build
```
Expected: 타입 에러 0.

- [ ] **Step 4: 수동 확인**

1. devtools 의 `Rendering → Emulate CSS prefers-reduced-motion: reduce` 를 켜고 WEDDING DATE 의 달력을 본다. 화살표가 29 와 같은 높이에 있어야 하고 "this day!" 와 겹치면 안 된다. 끄고 켠 상태의 화살표 수직 위치가 같아야 한다.
2. 마음 전하실 곳 섹션을 펼쳐 계좌번호를 마우스로 드래그해 본다. 선택이 되어야 한다. 그 상태에서 복사 버튼 클릭도 정상 동작해야 한다.

- [ ] **Step 5: 커밋**

```bash
git add app/globals.css components/Account.tsx
git commit -m "fix: reduced-motion 화살표 정렬과 계좌번호 선택 불가 문제 수정"
```

---

## 최종 검증

- [ ] **빌드·테스트**

```bash
npm run build && npm test
```
Expected: 타입 에러 0, `Test Files 3 passed (3)` / `Tests 27 passed (27)`.

- [ ] **디버그 오버레이가 기본 경로에 새지 않는지**

```bash
npm run dev
curl -s localhost:3000 | grep -c 'hydrated ok'
```
Expected: `0`. 오버레이는 클라이언트에서 `?debug=1` 일 때만 렌더되므로 SSR HTML 에 문자열이 없어야 한다.

- [ ] **실기기 확인 — 사람이 해야 하는 일**

배포 후 카카오톡에서 `?debug=1` 로 열어 Task 1 Step 6 의 네 항목을 기록한다. 그 결과에 따라:

- `hydrated ok` 가 **안 보이면** → 하이드레이션 실패가 근본 원인이다. `ERROR` 줄의 메시지로 별도 조사를 시작한다. 이 플랜의 Task 2~4 는 유효하지만 증상과는 무관하다.
- `hydrated ok` 가 **보이고** 스와이프·탭이 여전히 죽어 있으면 → `card-zoom` 값과 `body touch-action` 값을 근거로 제스처 쪽을 판다. `card-zoom` 이 1 이 아니면 WebKit 의 `zoom` 히트 테스트를 의심하고, 그때는 `zoom` 을 제거하고 카드 폭을 직접 키우는 방향을 검토한다(데스크톱 시각 변경을 수반하므로 사용자 승인 필요).
- 둘 다 정상이면 → 인앱 브라우저의 제스처 정책 문제로 좁혀지며, `touch-action` 을 `manipulation` 으로 완화하는 실험이 다음 단계다(핀치 줌 차단을 포기하는 대가).

## 이번 범위에서 의도적으로 뺀 것

- **`zoom` 제거.** 데스크톱에서 카드가 500px → 430px 로 줄어드는 시각 변경이라 사용자 승인이 필요하다. Task 1 의 실기기 데이터가 `zoom` 을 지목하면 그때 별도로 제안한다.
- **`user-scalable=no` 롤백.** 사용자가 비용을 들은 뒤 명시적으로 요청한 설정이다. 실기기 데이터가 이것을 지목하기 전에는 건드리지 않는다.
- **`bgm.mp3` 7MB 재인코딩.** 인터랙션과 무관하다. 전체 리뷰의 별도 지적으로 남아 있다.
- **IntersectionObserver 기반 지도 지연 로드.** 성능 개선이지 인터랙션 수정이 아니다.
