# 김경식 ♥ 김수민 모바일 청첩장

2026년 11월 29일 일요일 오후 4시 20분 · 더파티움 안양 7F 라포레홀

https://ks-sm-wedding-invitation.vercel.app/

## 화면 구성

위에서부터 순서대로 아래 섹션이 이어진다. 상단에는 BGM 토글이 고정돼 있다.

- 커버
- 메인 사진, 초대 인사말 (`app/page.tsx` 에 인라인)
- WEDDING DATE: 달력과 예식까지 남은 시간 카운트다운
- WEDDING GALLERY: 사진 20장. 카드 더미를 넘기는 스와이프와 라이트박스
- LOCATION: 약도, 네이버지도·티맵·카카오맵 길찾기, 교통편 안내
- INFOMATION: 안내 문구. 좌우 스와이프로 넘긴다
- GUEST BOOK: 방명록. 작성할 때 정한 비밀번호로 삭제한다
- CONTACT: 양가 연락처. `tel:` / `sms:` 링크
- 마음 전하실 곳: 계좌번호와 복사 버튼
- 아웃트로: 엔딩 크레딧

문구, 연락처, 계좌, 교통편, 크레딧 같은 콘텐츠는 전부 `lib/data.ts` 에 있다. 내용을 바꿀 때는 이 파일만 고치면 된다.

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- Neon Postgres (`@neondatabase/serverless`): 방명록 저장
- Vitest: 단위 테스트
- Vercel 배포, Node 24.x

## 개발

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 카운트다운 / 달력 · 방명록 해싱·검증 · BGM 자동재생 · 콘텐츠 문구 단위 테스트
npm run build   # 프로덕션 빌드
```

환경변수는 `.env.local` 에 넣는다.

- `DATABASE_URL` (필수): Neon 연결 문자열. 형식은 `.env.example` 참고. 없으면 `lib/db.ts` 가 시작 시점에 바로 에러를 던진다. Vercel 에서는 Neon 연동 시 자동으로 들어간다.
- `NEXT_PUBLIC_SITE_URL` (선택): OG 이미지 절대경로의 기준 주소. 기본값이 위 배포 주소라서 커스텀 도메인을 붙일 때만 설정한다.

방명록 테이블은 마이그레이션 도구 없이 `db/schema.sql` 을 Neon 콘솔에서 직접 실행해서 만든다.

## 구조

```
app/page.tsx         섹션 조립 (메인 사진 · 인사말은 여기 인라인)
app/layout.tsx       폰트 · 메타데이터 · OG · 아이콘 · viewport
app/api/guestbook/   방명록 등록(POST) · 조회(GET) · 삭제(DELETE) API 라우트
components/          섹션별 컴포넌트 + 공용 SectionHeading / Sticker / Toast / BgmToggle
hooks/               useReveal (등장 애니메이션) · useSwipeStack (갤러리 카드 드래그)
lib/data.ts          모든 콘텐츠 상수
lib/wedding.ts       예식 일시 · countdownUnits() · calendarRows()
lib/guestbook.ts     방명록 비밀번호 해싱 · 입력 검증 · 날짜 포맷
lib/autoplay.ts      BGM 자동재생 (첫 제스처까지 재생 재시도)
lib/db.ts            Neon Postgres 클라이언트
lib/__tests__/       단위 테스트
db/schema.sql        guestbook 테이블 DDL
public/audio/        BGM
public/images/       사진 · 스티커 · 지도앱 로고 · OG 이미지 · favicon/
```

## 구현 메모

- **카드 확대**: 카드는 430px 폭 기준으로 디자인했다. 뷰포트가 500px 이상이면 `zoom` 으로 통째로 1.163배 확대해 500px 폭으로 보여준다 (`--card-zoom`, `app/globals.css`). px 값을 다시 쓰지 않고 폰트, 여백, 이미지를 같은 비율로 키우려는 방식이다.
- **커버·아웃트로 높이**: 뷰포트 높이 대신 `aspect-[1/1.75] min-h-140` 으로 잡는다. `dvh` 로 잡으면 `zoom` 이 곱해져서 상쇄 계산이 필요해진다.
- **카드 바깥 요소**: 토스트는 카드 바깥에 있어서 같은 `zoom` 을 따로 건다 (`components/Toast.tsx`). 갤러리 라이트박스는 `zoom` 이 자손의 `position:fixed` 까지 스케일하므로 `createPortal` 로 `document.body` 에 붙인다.
- **`line-height`**: Tailwind preflight 의 `1.5` 를 `normal` 로 되돌렸다. 디자인이 브라우저 기본 줄간격 기준이라 `1.5` 로 두면 섹션이 세로로 길어진다.
- **BGM 자동재생**: 브라우저가 소리 있는 자동재생을 막기 때문에 첫 제스처(`pointerdown` · `touchstart` · `keydown`)에서 재생을 시도하고, 거부되면 다음 제스처에서 다시 시도한다 (`lib/autoplay.ts`).
- **카카오맵**: 카카오내비 딥링크는 JS SDK 앱키가 필요해서, 앱키 없이 동작하는 카카오맵 길찾기 링크를 쓴다.
- **다크 모드**: 삼성 인터넷의 "웹페이지 어두운 모드"와 Chrome auto-dark 가 사진 색을 반전시켜서 `viewport.colorScheme` 을 `light` 로 고정했다.
- **아이콘**: 파비콘·애플 아이콘은 Next 파일 규칙(`app/favicon.ico` · `app/icon.svg` · `app/apple-icon.png`)으로 등록한다. URL 에 내용 해시가 붙어서 아이콘을 바꾸면 캐시를 타지 않는다. PWA 아이콘과 manifest 는 `public/images/favicon/` 에 두고 `app/layout.tsx` 의 metadata 로 연결한다.
