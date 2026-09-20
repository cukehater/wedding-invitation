"use client";
import { useEffect, useRef, useState } from "react";
import { VENUE } from "@/lib/data";

const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const SDK_ID = "kakao-maps-sdk";
const SDK_SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`;

// SDK 스크립트를 한 번만 넣고, 이후 호출은 같은 Promise 를 재사용한다.
let sdkPromise: Promise<void> | null = null;

function loadSdk() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    if (existing) {
      // Fast Refresh 등으로 모듈이 재실행돼 sdkPromise 는 null 이 됐지만 스크립트 태그는
      // 살아있는 경우, load 이벤트가 이미 지나갔을 수 있다 — 이미 로드됐으면 즉시 resolve.
      if (window.kakao?.maps) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("kakao sdk load failed")), { once: true });
      return;
    }
    const el = document.createElement("script");
    el.id = SDK_ID;
    el.src = SDK_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("kakao sdk load failed"));
    document.head.appendChild(el);
  });
  return sdkPromise;
}

export function KakaoMap() {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!KEY);

  useEffect(() => {
    if (!KEY) return;
    let alive = true;
    loadSdk()
      .then(() => {
        window.kakao.maps.load(() => {
          if (!alive || !box.current) return;
          const center = new window.kakao.maps.LatLng(VENUE.lat, VENUE.lng);
          const map = new window.kakao.maps.Map(box.current, { center, level: 4 });
          new window.kakao.maps.Marker({ map, position: center });
        });
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <div role="img" aria-label={`${VENUE.name} 지도`}
        className="flex aspect-video w-full items-center justify-center bg-[#F4F1EE] text-[12px] text-[#9A928C]">
        지도를 불러오지 못했어요. 아래 버튼으로 열어주세요.
      </div>
    );
  }

  return <div ref={box} role="img" aria-label={`${VENUE.name} 지도`} className="aspect-video w-full" />;
}
