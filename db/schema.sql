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
