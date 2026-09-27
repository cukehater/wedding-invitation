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
  { title: "지하철 이용 시", body: "4호선 '평촌역' 3번 출구 횡단보도 맞은편" },
  {
    title: "버스 이용 시",
    body: "'평촌역' 하차\n[일반버스] 1, 6, 22, 52, 52-1, 83\n[마을버스] 2-1, 5, 5-1, 5-5, 6, 6-1, 7, 8, 10-1",
  },
  {
    title: "자가용 이용 시",
    body: "네비게이션 검색 - '더파티움 안양' 또는 '시민대로 311' 입력\n\n[제1주차장] 더파티움 안양 본건물 지하주차장\n동안구 시민대로 311\n\n[제2주차장] 지아이에스(구. 네온테크) 주차장\n동안구 부림로 146 · 토·일 이용가능 (공휴일 이용불가)\n\n[제3주차장] 이마트 평촌점 주차장\n동안구 시민대로 300\n\n[제4주차장] 평촌 칼라힐 주차빌딩 (2층부터 주차가능)\n동안구 시민대로 312",
  },
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

// 티맵 경로안내 스킴은 iOS 와 Android 의 파라미터 이름이 다르다 (rGoName/rGoX/rGoY vs goalname/goalx/goaly).
// Universal Link 은 SK 가 지원하지 않아서 앱 미설치 시 iOS Safari 의 "주소가 유효하지 않습니다" 알럿은 못 막는다.
// 알럿을 닫으면 Location 의 타이머 폴백이 스토어로 보낸다.
const TMAP_GOAL = encodeURIComponent(VENUE.query);
export const TMAP = {
  ios: `tmap://route?rGoName=${TMAP_GOAL}&rGoX=${VENUE.lng}&rGoY=${VENUE.lat}`,
  android: `tmap://route?goalname=${TMAP_GOAL}&goalx=${VENUE.lng}&goaly=${VENUE.lat}`,
  iosStore: "https://apps.apple.com/kr/app/id431589174",
  androidStore: "https://play.google.com/store/apps/details?id=com.skt.tmap.ku",
};

// 네이버·카카오는 앱 미설치 시 웹으로 폴백된다. 티맵만 scheme 플래그로 표시하고
// Location 에서 플랫폼 분기 + 스토어 폴백을 붙인다.
export const MAP_APPS: { name: string; logo: string; href: string; scheme?: boolean }[] = [
  { name: "네이버지도", logo: "/images/naver_map.webp", href: `https://map.naver.com/p/search/${encodeURIComponent(VENUE.query)}` },
  { name: "티맵", logo: "/images/tmap.svg", href: TMAP.android, scheme: true },
  { name: "카카오맵", logo: "/images/kakao_map.webp", href: `https://map.kakao.com/link/to/${encodeURIComponent(VENUE.query)},${VENUE.lat},${VENUE.lng}` },
];
