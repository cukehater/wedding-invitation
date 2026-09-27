import type { Metadata, Viewport } from "next";
import {
  Montserrat,
  Playfair_Display,
  Hurricane,
  Tangerine,
  Alex_Brush,
  IBM_Plex_Sans_KR,
} from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
});
const hurricane = Hurricane({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hurricane",
});
const tangerine = Tangerine({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-tangerine-src",
});
const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alexbrush-src",
});
const plexKr = IBM_Plex_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plexkr",
});

// OG 이미지는 절대경로여야 카카오톡 미리보기가 뜬다. 커스텀 도메인을 붙이면 NEXT_PUBLIC_SITE_URL 로 덮어쓴다.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://ks-sm-wedding-invitation.vercel.app";

const TITLE = "경식·수민 결혼식에 초대합니다.";
const DESCRIPTION =
  "2026년 11월 29일 일요일 오후 4시 20분 · 더파티움 안양 7F 라포레홀";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/images/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/images/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/images/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: "/images/favicon/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = [
    montserrat,
    playfair,
    hurricane,
    tangerine,
    alexBrush,
    plexKr,
  ]
    .map((f) => f.variable)
    .join(" ");
  return (
    <html lang="ko" className={fontVars}>
      <body className="font-body">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
