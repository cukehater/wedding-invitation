import type { Metadata } from "next";
import {
  Montserrat, Playfair_Display, Hurricane, Tangerine, Alex_Brush, IBM_Plex_Sans_KR,
} from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-playfair" });
const hurricane = Hurricane({ subsets: ["latin"], weight: "400", variable: "--font-hurricane" });
const tangerine = Tangerine({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-tangerine-src" });
const alexBrush = Alex_Brush({ subsets: ["latin"], weight: "400", variable: "--font-alexbrush-src" });
const plexKr = IBM_Plex_Sans_KR({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-plexkr" });

// TODO: 배포 후 NEXT_PUBLIC_SITE_URL 을 실제 도메인으로 설정 (카카오톡 공유 OG 이미지 절대경로용)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "김경식 ♥ 김수민 결혼합니다",
  description: "2026년 11월 29일 일요일 오후 4시 20분 · 더파티움 안양 7F 라포레홀",
  openGraph: {
    title: "김경식 ♥ 김수민 결혼합니다",
    description: "2026년 11월 29일 일요일 오후 4시 20분 · 더파티움 안양 7F 라포레홀",
    images: ["/images/main-photo.webp"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [montserrat, playfair, hurricane, tangerine, alexBrush, plexKr]
    .map((f) => f.variable).join(" ");
  return (
    <html lang="ko" className={fontVars}>
      <body className="font-body">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
