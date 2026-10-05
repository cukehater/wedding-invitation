# 김경식 ♥ 김수민 모바일 청첩장

Claude Design 산출물을 Next.js 앱으로 이식한 결과물. 원본 산출물은 이식이 끝난 뒤 저장소에서 제거했다.
2026년 11월 29일 일요일 오후 4시 20분 · 더파티움 안양 7F 라포레홀

https://ks-sm-wedding-invitation.vercel.app/

## 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 카운트다운 / 달력 · 방명록 해싱·검증 단위 테스트
npm run build   # 프로덕션 빌드
```

카드는 430px 폭 기준으로 디자인됐고, 뷰포트가 500px 이상이면 `zoom` 으로 통째로 1.163배 확대해 500px 폭이 된다 (`--card-zoom`, `app/globals.css`). px 값을 하나하나 다시 쓰지 않고 비례 확대하기 위한 방식이다. 폰트 크기·여백·이미지가 전부 같은 비율로 커진다.

커버와 아웃트로는 뷰포트 높이가 아니라 `aspect-[1/1.75] min-h-140` 으로 잡는다 — 높이를 `dvh` 로 잡으면 `zoom` 이 곱해져 상쇄 계산이 따라붙는데, 비율로 잡으면 그 문제가 아예 없다. 카드 바깥에 있는 토스트에는 같은 `zoom` 을 따로 걸어준다. 갤러리 라이트박스는 `zoom` 이 자손의 `position:fixed` 까지 스케일하므로 `createPortal` 로 `document.body` 에 붙인다.

## 구조

```
app/page.tsx        섹션 조립 (s2 메인사진 · s3 인사말은 여기 인라인)
components/         섹션별 컴포넌트 + 공용 SectionHeading / Sticker / Toast / BgmToggle
hooks/              useReveal (등장 애니메이션) · useSwipeStack (갤러리 카드 드래그)
lib/data.ts         모든 콘텐츠 상수 (연락처 · 계좌 · 교통 · 크레딧 · 안내문구)
lib/wedding.ts      countdownUnits() · calendarRows()
lib/guestbook.ts    방명록 해싱 · 검증 · 날짜 로직
lib/db.ts           Neon Postgres 클라이언트
app/api/guestbook/  방명록 등록(POST) · 조회(GET) · 삭제(DELETE) API 라우트
db/schema.sql       guestbook 테이블 DDL (마이그레이션 도구 없이 Neon 콘솔에서 수동 실행)
```

이식 당시 원본과의 픽셀 일치를 섹션 높이로 검증했다 (11개 섹션 전부 + 전체 높이 7247px 동일). 원본이 지금은 저장소에 없어서 재확인은 불가능하다.

## 원본에서 달라진 점

- **전화 · 문자 · 지도앱 · BGM**: 원본은 토스트만 띄우는 스텁이었다. 각각 `tel:` / `sms:` / 지도앱 딥링크 / `<audio>` 실제 재생으로 바꿨다.
- **카카오내비 → 카카오맵**: 카카오내비 딥링크는 JS SDK 앱키가 필요하다. 앱키 없이 바로 동작하는 카카오맵 길찾기 링크로 대체하고 라벨도 맞췄다.
- **HappyTimeTwo 폰트 제거**: 원본이 지정한 눈누 CDN(`projectnoonnu/2408-3@1.0/HappyTimeTwo.css`)이 404 라 **원본에서도** Montserrat 로 렌더되고 있었다. 죽은 링크와 폰트 이름을 모두 지우고 영문 제목은 Montserrat 로 통일했다.
- **INFOMATION 전환**: 원본은 `pointer-events:none` 때문에 클릭 전환이 죽어 자동 순환만 됐다. 폰에서는 탭보다 스와이프가 자연스러워서 탭 전환을 아예 없애고 좌우 스와이프로 바꿨다 (`components/Information.tsx`).
- **`line-height`**: Tailwind preflight 의 `1.5` 를 `normal` 로 되돌렸다. 그대로 두면 모든 섹션이 원본보다 세로로 길어진다 (`app/globals.css`).

## 남은 작업

- `lib/data.ts` 의 `ACCOUNT_SIDES` — 계좌번호가 실제 값인지 확인 필요.
- `NEXT_PUBLIC_SITE_URL` — 기본값이 위 배포 주소다. 커스텀 도메인을 붙일 때만 설정한다.
- 카카오톡 공유 SDK — 미구현. 원본에도 UI 가 없었다.
