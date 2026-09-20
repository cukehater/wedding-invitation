// 브라우저는 사용자 제스처 없는 play() 를 거부한다. 우회는 불가능하므로
// 첫 제스처에 한 번만 재생을 붙인다. 하객 체감상 자동재생과 같다.
export const GESTURE_EVENTS = [
  "pointerdown",
  "touchstart",
  "keydown",
  "scroll",
] as const;

export function armAutoplay(target: EventTarget, onFirstGesture: () => void) {
  let armed = true;

  const disarm = () => {
    if (!armed) return;
    armed = false;
    for (const type of GESTURE_EVENTS) target.removeEventListener(type, fire);
  };

  const fire = () => {
    if (!armed) return;
    disarm();
    try {
      // 콜백이 던지거나 reject 해도 리스너는 이미 정리된 상태다.
      // Node/브라우저 EventTarget 은 리스너 예외를 전역으로 리포트하므로 여기서 삼킨다.
      onFirstGesture();
    } catch {}
  };

  for (const type of GESTURE_EVENTS) {
    target.addEventListener(type, fire, { passive: true });
  }

  return disarm;
}
