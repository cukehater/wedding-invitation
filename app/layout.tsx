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

const TITLE = "경식♡수민 결혼식에 초대합니다.";
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
        {/* ?debug=1 일 때만 동작하는 진단 장치. 인앱 브라우저에는 devtools 가 없고,
            하이드레이션이 죽으면 React 기반 도구도 같이 죽으므로 인라인 스크립트여야 한다. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function () {\n  if (location.search.indexOf("debug") === -1) return;\n  var buf = [];\n  var box = null;\n  var add = function (s) {\n    buf.push(s);\n    if (!box) return;\n    var d = document.createElement("div");\n    d.textContent = s;\n    box.appendChild(d);\n  };\n  // \ub9ac\uc2a4\ub108\ub294 \uc989\uc2dc \uac74\ub2e4. DOM \uc870\uc791\uc740 \ud558\uc774\ub4dc\ub808\uc774\uc158 \uc774\ud6c4\ub85c \ubbf8\ub8ec\ub2e4 \u2014\n  // \ud558\uc774\ub4dc\ub808\uc774\uc158 \uc804\uc5d0 body \ub97c \uac74\ub4dc\ub9ac\uba74 React \uac00 \ubd88\uc77c\uce58\ub85c \ud2b8\ub9ac\ub97c \uc7ac\uc0dd\uc131\ud558\uba70\n  // \uc774 \uc624\ubc84\ub808\uc774\ub97c \uc9c0\uc6b0\uace0, \uc9c4\ub2e8 \uc7a5\uce58\uac00 \uc2a4\uc2a4\ub85c \uc99d\uc0c1\uc744 \ub9cc\ub4e0\ub2e4.\n  addEventListener("error", function (e) {\n    var t = e.target;\n    if (t && (t.tagName === "SCRIPT" || t.tagName === "LINK")) add("LOAD FAIL " + (t.src || t.href));\n    else add("ERROR " + e.message + " @ " + (e.filename || "?") + ":" + e.lineno);\n  }, true);\n  addEventListener("unhandledrejection", function (e) {\n    add("REJECT " + String(e.reason).slice(0, 200));\n  });\n\n  var mount = function () {\n    box = document.createElement("div");\n    box.setAttribute("style",\n      "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;max-height:46vh;overflow:auto;" +\n      "background:rgba(0,0,0,.88);color:#8FE388;font:10px/1.5 ui-monospace,monospace;padding:8px;" +\n      "white-space:pre-wrap;word-break:break-all");\n    document.body.appendChild(box);\n    var pending = buf.slice();\n    buf = [];\n    add("inline script OK");\n    add("ua " + navigator.userAgent);\n    add("vw " + innerWidth + " dpr " + devicePixelRatio + " touch " + navigator.maxTouchPoints);\n    add("card-zoom " + getComputedStyle(document.documentElement).getPropertyValue("--card-zoom").trim() +\n        " | touch-action " + getComputedStyle(document.body).touchAction);\n    for (var i = 0; i < pending.length; i++) add(pending[i]);\n    var t = document.body.innerText || "";\n    var dead = t.indexOf("DAYS") !== -1 && t.indexOf("--") !== -1;\n    add(dead ? ">>> HYDRATION DEAD (\uce74\uc6b4\ud2b8\ub2e4\uc6b4 -- \ub85c \uba48\ucda4)" : ">>> hydration OK (\uce74\uc6b4\ud2b8\ub2e4\uc6b4 \ub3d9\uc791)");\n  };\n  addEventListener("load", function () { setTimeout(mount, 1500); });\n})();\n',
          }}
        />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
