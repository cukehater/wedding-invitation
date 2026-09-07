export const VENUE = {
  name: "더파티움 안양, 7F 라포레 홀",
  address: "경기 안양시 동안구 시민대로 311 (관양동 1746)",
  query: "더파티움 안양",
  lat: 37.39452,
  lng: 126.97005,
} as const;

// TODO: 실제 전화번호로 교체 필요 (원본 산출물에 번호 없음)
export const CONTACTS = [
  { role: "신랑", name: "김경식", tel: "010-0000-0001" },
  { role: "신랑 아버지", name: "김홍창", tel: "010-0000-0002" },
  { role: "신랑 어머니", name: "박귀자", tel: "010-0000-0003" },
  { role: "신부", name: "김수민", tel: "010-0000-0004" },
  { role: "신부 어머니", name: "윤경애", tel: "010-0000-0005" },
];

export const ACCOUNT_SIDES = [
  {
    key: "groom",
    title: "신랑 측 계좌번호",
    rows: [
      { role: "신랑", name: "김경식", acct: "카카오뱅크 3333-01-1234567" },
      { role: "아버지", name: "김홍창", acct: "국민 123-45-6789-012" },
      { role: "어머니", name: "박귀자", acct: "농협 302-1234-5678-01" },
    ],
  },
  {
    key: "bride",
    title: "신부 측 계좌번호",
    rows: [
      { role: "신부", name: "김수민", acct: "토스뱅크 1000-1234-5678" },
      { role: "어머니", name: "윤경애", acct: "신한 110-123-456789" },
    ],
  },
];

export const TRAFFIC_WAYS = [
  { title: "지하철", body: "4호선 평촌역 3번 출구\n횡단보도 맞은편" },
  { title: "버스", body: "평촌역 하차\n일반 1, 6, 22, 52, 52-1, 83\n마을 2-1, 5, 5-1, 5-5, 6, 6-1, 7, 8, 10-1" },
  { title: "자가용", body: "내비게이션에 '더파티움 안양' 또는\n'시민대로 311' 입력" },
  { title: "주차", body: "제1주차장 · 더파티움 안양 본건물 지하주차장\n동안구 시민대로 311 (관양동 1746)\n\n제2주차장 · 지아이에스(구. 네온테크) 주차장\n동안구 부림로 146 (관양동 1745-3)\n토·일 이용 가능 (공휴일 이용 불가)\n\n제3주차장 · 이마트 평촌점 주차장\n동안구 시민대로 300 (관양동 1608)\n\n제4주차장 · 평촌 칼라힐 주차빌딩 (하이파킹 주차타워)\n동안구 시민대로 312 (평촌동 897)\n2층부터 주차 가능" },
];

export const INFO_TEXTS = [
  "예식은 11월 29일 일요일 오후 4시 20분, 더파티움 안양 7층 라포레홀에서 진행됩니다.",
  "예식 후 식사는 7층 뷔페홀에 준비되어 있어요. 편하게 오셔서 즐겨주세요.",
  "건물 지하주차장을 포함해 제1~4주차장을 이용하실 수 있습니다.",
  "예식 후 단체 사진 촬영이 있습니다. 자리를 지켜주시면 감사하겠습니다.",
];
export const INFO_IMAGES = ["g02", "g05", "g07", "g09"];

export const CREDITS = [
  { k: "Produced by", v: "our family" },
  { k: "Story begins", v: "since 2022" },
  { k: "Directed by", v: "김경식, 김수민" },
  { k: "Special thanks to", v: "축하를 보내주신 모든 분들" },
  { k: "Forever with", v: "Love & Happiness" },
];

export const GALLERY = Array.from({ length: 10 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0");
  return { src: `/images/gallery/g${n}.webp`, alt: `갤러리 사진 ${n}` };
});

// 셋 다 앱 미설치 시 웹으로 폴백되는 링크. 티맵만 커스텀 스킴(앱 전용).
export const MAP_APPS = [
  { name: "네이버지도", tint: "#CFE3D4", href: `https://map.naver.com/p/search/${encodeURIComponent(VENUE.query)}` },
  { name: "티맵", tint: "#D6DDEE", href: `tmap://route?goalname=${encodeURIComponent(VENUE.query)}&goalx=${VENUE.lng}&goaly=${VENUE.lat}` },
  { name: "카카오맵", tint: "#F3E6C8", href: `https://map.kakao.com/link/to/${encodeURIComponent(VENUE.query)},${VENUE.lat},${VENUE.lng}` },
];

export type Guest = { id: string; name: string; date: string; msg: string };

// TODO(backlog): 실제 방명록 DB 연동. 지금은 더미 시드 + 메모리 상태.
export const SEED_GUESTS: Guest[] = [
  { id: "s1", name: "이서연", date: "2026.09.02", msg: "두 분 웃는 모습이 참 닮았어요! 늘 지금처럼 행복하게 지내요" },
  { id: "s2", name: "박도현", date: "2026.08.28", msg: "경식아 축하한다! 그날 제일 크게 박수 쳐줄게" },
  { id: "s3", name: "최하늘", date: "2026.08.25", msg: "수민이 신부 되는 날이라니 벅차네요. 예쁜 가정 이루길!" },
  { id: "s4", name: "정민재", date: "2026.08.21", msg: "두 사람의 새로운 시작을 진심으로 축하합니다" },
  { id: "s5", name: "한유진", date: "2026.08.19", msg: "11월 29일 꼭 갈게요! 행복만 가득하길 바라요" },
  { id: "s6", name: "오세라", date: "2026.08.14", msg: "언제나 웃음 많은 부부로 지내세요, 축하해요!" },
];
