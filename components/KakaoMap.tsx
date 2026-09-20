"use client";
import { useEffect, useRef, useState } from "react";
import { VENUE } from "@/lib/data";

const KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
const SDK_ID = "kakao-maps-sdk";
const SDK_SRC = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false&libraries=services`;

// 지오코더는 지번 괄호를 못 읽는다. "... 시민대로 311 (관양동 1746)" 에서 도로명까지만 남긴다.
const GEO_QUERY = VENUE.address.replace(/\s*\(.*\)\s*$/, "");

// 라벨은 카카오 장소 검색 결과라 외부 입력이다. innerHTML 로 들어가므로 이스케이프한다.
const esc = (v: string) =>
  v.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

// 기본 마커 대신 청첩장 톤에 맞춘 핑크 하트 핀.
const pin = (label: string) => `
  <div style="text-align:center;line-height:0">
    <div style="display:inline-block;margin-bottom:3px;padding:3px 10px;border:1px solid #E8859B;
      border-radius:999px;background:#fff;color:#B75C74;font-size:11px;line-height:1.5;
      white-space:nowrap;box-shadow:0 1px 5px rgba(60,50,52,.2)">${esc(label)}</div>
    <svg width="34" height="44" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 45S34 29 34 17A16 16 0 1 0 2 17c0 12 16 28 16 28z"
        fill="#E8859B" stroke="#fff" stroke-width="2.5"/>
      <path d="M18 25.4c-.3 0-.6-.1-.8-.3l-4.7-4.3c-1.6-1.4-1.7-3.8-.2-5.2 1.4-1.4 3.5-1.4 4.8-.1l.9.8.9-.8c1.3-1.3 3.4-1.3 4.8.1 1.5 1.4 1.4 3.8-.2 5.2l-4.7 4.3c-.2.2-.5.3-.8.3z"
        fill="#fff"/>
    </svg>
  </div>`;

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
          const { services } = window.kakao.maps;

          // x=경도, y=위도 를 문자열로 준다.
          const draw = (lng: string, lat: string, label: string) => {
            const el = box.current;
            if (!alive || !el) return;
            const center = new window.kakao.maps.LatLng(Number(lat), Number(lng));
            const map = new window.kakao.maps.Map(el, { center, level: 5 });
            new window.kakao.maps.CustomOverlay({
              map,
              position: center,
              content: pin(label),
              xAnchor: 0.5,
              yAnchor: 1,
            });
          };

          // 장소 검색이 건물 정확도가 가장 높고 상호명도 같이 준다.
          // 못 찾으면 도로명 주소로 폴백한다.
          new services.Places().keywordSearch(VENUE.query, (places, status) => {
            if (!alive) return;
            if (status === services.Status.OK && places[0]) {
              draw(places[0].x, places[0].y, places[0].place_name);
              return;
            }
            new services.Geocoder().addressSearch(GEO_QUERY, (addrs, addrStatus) => {
              if (!alive) return;
              if (addrStatus !== services.Status.OK || !addrs[0]) {
                setFailed(true);
                return;
              }
              draw(addrs[0].x, addrs[0].y, VENUE.query);
            });
          });
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
