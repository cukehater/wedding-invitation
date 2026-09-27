import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev 서버를 폰이나 LAN IP 로 열면 Next 가 dev 전용 엔드포인트(HMR 등) 요청을 cross-origin 으로 보고 차단한다.
  // 개발 전용 설정이라 프로덕션 번들에는 영향이 없다. IP 가 바뀌면 여기도 바꾼다.
  allowedDevOrigins: ["192.168.219.109"],
};

export default nextConfig;
