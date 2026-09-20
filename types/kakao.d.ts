// 카카오맵 SDK 는 공식 타입 패키지를 제공하지 않는다. 쓰는 API 가 지도/마커/지오코더뿐이라
// 전체 타이핑 대신 최소 선언만 둔다.
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (cb: () => void) => void;
        LatLng: new (lat: number, lng: number) => unknown;
        Map: new (container: HTMLElement, opts: { center: unknown; level: number }) => unknown;
        CustomOverlay: new (opts: {
          map: unknown;
          position: unknown;
          content: string;
          xAnchor?: number;
          yAnchor?: number;
        }) => unknown;
        // libraries=services 를 붙여야 존재한다.
        services: {
          Status: { OK: string };
          Geocoder: new () => {
            addressSearch: (
              address: string,
              cb: (result: { x: string; y: string }[], status: string) => void,
            ) => void;
          };
          Places: new () => {
            keywordSearch: (
              keyword: string,
              cb: (result: { x: string; y: string; place_name: string }[], status: string) => void,
            ) => void;
          };
        };
      };
    };
  }
}

export {};
