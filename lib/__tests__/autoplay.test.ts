import { describe, expect, it, vi } from "vitest";
import { armAutoplay, GESTURE_EVENTS } from "@/lib/autoplay";

// disarm 은 콜백 Promise 가 resolve 된 뒤(마이크로태스크)에 일어난다.
const tick = () => Promise.resolve();

describe("armAutoplay", () => {
  it("첫 제스처에 콜백을 실행한다", () => {
    const target = new EventTarget();
    const fn = vi.fn(() => Promise.resolve());
    armAutoplay(target, fn);

    target.dispatchEvent(new Event("pointerdown"));

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("scroll 은 제스처로 보지 않는다", () => {
    const target = new EventTarget();
    const fn = vi.fn(() => Promise.resolve());
    armAutoplay(target, fn);

    target.dispatchEvent(new Event("scroll"));

    expect(fn).not.toHaveBeenCalled();
  });

  it("재생에 성공하면 이후 제스처를 무시한다", async () => {
    const target = new EventTarget();
    const fn = vi.fn(() => Promise.resolve());
    armAutoplay(target, fn);

    target.dispatchEvent(new Event("pointerdown"));
    await tick();
    target.dispatchEvent(new Event("touchstart"));
    target.dispatchEvent(new Event("keydown"));

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("재생에 성공하면 모든 제스처 리스너를 제거한다", async () => {
    const target = new EventTarget();
    const remove = vi.spyOn(target, "removeEventListener");
    armAutoplay(target, () => Promise.resolve());

    target.dispatchEvent(new Event("pointerdown"));
    await tick();

    expect(remove).toHaveBeenCalledTimes(GESTURE_EVENTS.length);
  });

  it("재생이 거부되면 다음 제스처에서 다시 시도한다", async () => {
    const target = new EventTarget();
    const fn = vi
      .fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(new Error("NotAllowedError"))
      .mockResolvedValueOnce(undefined);
    armAutoplay(target, fn);

    target.dispatchEvent(new Event("pointerdown"));
    await tick();
    target.dispatchEvent(new Event("touchstart"));
    await tick();
    target.dispatchEvent(new Event("keydown"));

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("반환된 해제 함수를 부르면 이후 제스처를 무시한다", () => {
    const target = new EventTarget();
    const fn = vi.fn(() => Promise.resolve());
    const disarm = armAutoplay(target, fn);

    disarm();
    target.dispatchEvent(new Event("pointerdown"));

    expect(fn).not.toHaveBeenCalled();
  });

  it("콜백이 동기적으로 던져도 전파하지 않고 다음 제스처를 기다린다", async () => {
    const target = new EventTarget();
    const fn = vi.fn<() => Promise<unknown>>(() => {
      throw new Error("play rejected");
    });
    armAutoplay(target, fn);

    expect(() => target.dispatchEvent(new Event("pointerdown"))).not.toThrow();
    await tick();
    target.dispatchEvent(new Event("touchstart"));

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
