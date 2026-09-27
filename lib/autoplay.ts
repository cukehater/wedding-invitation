// 브라우저는 사용자 제스처 없는 play() 를 거부한다. 우회는 불가능하므로
// 제스처에 재생을 붙인다. 하객 체감상 자동재생과 같다.
// scroll 은 목록에 없다 — WebKit/Blink 모두 스크롤에는 user activation 을 주지 않아
// 여기서 play() 를 불러봐야 거부되고, 그 한 번으로 기회만 날린다.
export const GESTURE_EVENTS = ["pointerdown", "touchstart", "keydown"] as const;

export function armAutoplay(
  target: EventTarget,
  // 재생 성공 시 resolve, 거부 시 reject 하는 콜백.
  onGesture: () => Promise<unknown>,
) {
  let armed = true;

  const disarm = () => {
    if (!armed) return;
    armed = false;
    for (const type of GESTURE_EVENTS) target.removeEventListener(type, fire);
  };

  const fire = () => {
    if (!armed) return;
    try {
      // 동기 호출이어야 한다. await 을 끼우면 user activation 이 끊겨 play() 가 거부된다.
      // 성공했을 때만 리스너를 뗀다 — 인앱 웹뷰처럼 첫 시도가 막히는 환경에서
      // 다음 제스처에 다시 시도할 수 있어야 한다.
      onGesture().then(disarm, () => {});
    } catch {
      // 콜백이 동기적으로 던져도 리스너는 그대로 둔다.
    }
  };

  for (const type of GESTURE_EVENTS) {
    target.addEventListener(type, fire, { passive: true });
  }

  return disarm;
}
