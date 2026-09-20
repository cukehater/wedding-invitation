import { describe, expect, it, vi } from "vitest";
import { armAutoplay, GESTURE_EVENTS } from "@/lib/autoplay";

describe("armAutoplay", () => {
  it("첫 제스처에 콜백을 실행한다", () => {
    const target = new EventTarget();
    const fn = vi.fn();
    armAutoplay(target, fn);

    target.dispatchEvent(new Event("pointerdown"));

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("제스처가 여러 번 와도 한 번만 실행한다", () => {
    const target = new EventTarget();
    const fn = vi.fn();
    armAutoplay(target, fn);

    target.dispatchEvent(new Event("pointerdown"));
    target.dispatchEvent(new Event("scroll"));
    target.dispatchEvent(new Event("keydown"));

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("실행 후 모든 제스처 리스너를 제거한다", () => {
    const target = new EventTarget();
    const remove = vi.spyOn(target, "removeEventListener");
    armAutoplay(target, () => {});

    target.dispatchEvent(new Event("pointerdown"));

    expect(remove).toHaveBeenCalledTimes(GESTURE_EVENTS.length);
  });

  it("반환된 해제 함수를 부르면 이후 제스처를 무시한다", () => {
    const target = new EventTarget();
    const fn = vi.fn();
    const disarm = armAutoplay(target, fn);

    disarm();
    target.dispatchEvent(new Event("pointerdown"));

    expect(fn).not.toHaveBeenCalled();
  });

  it("콜백이 던져도 리스너 정리는 끝낸다", () => {
    const target = new EventTarget();
    const remove = vi.spyOn(target, "removeEventListener");
    armAutoplay(target, () => {
      throw new Error("play rejected");
    });

    expect(() => target.dispatchEvent(new Event("pointerdown"))).not.toThrow();
    expect(remove).toHaveBeenCalledTimes(GESTURE_EVENTS.length);
  });
});
