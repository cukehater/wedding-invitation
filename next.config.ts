import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev 서버를 폰이나 LAN IP 로 열면 Next 가 dev 전용 엔드포인트(HMR 등) 요청을 cross-origin 으로 보고 차단한다.
  // 개발 전용 설정이라 프로덕션 번들에는 영향이 없다.
  // 매처는 호스트를 "." 로 쪼개 우측부터 비교하므로 IP 에도 와일드카드가 먹는다.
  // 공유기가 IP 를 바꿔도 다시 고칠 필요 없도록 사설 대역을 통째로 허용한다.
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
