/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerHost } from "./coordinator";
import { announce } from "./announce";

describe("announcement host coordinator", () => {
  const cleanups: Array<() => void> = [];
  const register = (scope: "root" | "modal", clear = vi.fn()) => {
    const host = { scope, publish: vi.fn(), clear };
    const unregister = registerHost(host);
    cleanups.push(unregister);
    return { ...host, unregister };
  };

  beforeEach(() => vi.useFakeTimers());
  afterEach(async () => {
    cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("waits for activation and routes each request to only one root host", () => {
    const root = register("root");
    const otherRoot = register("root");
    announce("First");
    vi.advanceTimersByTime(99);
    expect(root.publish).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(root.publish).toHaveBeenCalledExactlyOnceWith("First", "polite");
    expect(otherRoot.publish).not.toHaveBeenCalled();
  });

  it("keeps the existing cooldown when switching to a modal", () => {
    const root = register("root");
    vi.advanceTimersByTime(100);
    announce("First");
    announce("Pending");
    vi.advanceTimersByTime(400);
    const modal = register("modal");
    expect(root.clear).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(599);
    expect(modal.publish).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(modal.publish).toHaveBeenCalledExactlyOnceWith("Pending", "polite");
    expect(root.publish).toHaveBeenCalledTimes(1);
  });

  it("does not send assertive updates to the root during modal activation", () => {
    const root = register("root");
    vi.advanceTimersByTime(100);
    announce("Root");
    const modal = register("modal");
    announce("Urgent", "assertive");
    vi.advanceTimersByTime(99);
    expect(modal.publish).not.toHaveBeenCalled();
    expect(root.publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(modal.publish).toHaveBeenCalledExactlyOnceWith("Urgent", "assertive");
  });

  it("restores nested modal hosts in activation order, then the root", () => {
    const root = register("root");
    const outer = register("modal");
    const inner = register("modal");
    announce("Inner");
    vi.advanceTimersByTime(100);
    expect(inner.publish).toHaveBeenCalledExactlyOnceWith("Inner", "polite");
    expect(outer.publish).not.toHaveBeenCalled();
    expect(root.publish).not.toHaveBeenCalled();

    announce("Outer pending");
    inner.unregister();
    vi.advanceTimersByTime(1000);
    expect(outer.publish).toHaveBeenCalledExactlyOnceWith("Outer pending", "polite");
    outer.unregister();
    announce("Root pending");
    vi.advanceTimersByTime(1000);
    expect(root.publish).toHaveBeenCalledExactlyOnceWith("Root pending", "polite");
  });

  it("does not restart activation when an inactive host is removed", () => {
    const root = register("root");
    const modal = register("modal");
    vi.advanceTimersByTime(50);
    root.unregister();
    announce("Modal");
    vi.advanceTimersByTime(50);
    expect(modal.publish).toHaveBeenCalledExactlyOnceWith("Modal", "polite");
  });

  it("cancels a superseded activation timer and never publishes to a removed host", () => {
    const root = register("root");
    const modal = register("modal");
    announce("Retained");
    vi.advanceTimersByTime(50);
    modal.unregister();
    vi.advanceTimersByTime(99);
    expect(root.publish).not.toHaveBeenCalled();
    expect(modal.publish).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(root.publish).toHaveBeenCalledExactlyOnceWith("Retained", "polite");
  });

  it("preserves duplicate history through handoffs without replaying published messages", () => {
    const root = register("root");
    announce("Same");
    vi.advanceTimersByTime(100);
    const modal = register("modal");
    announce("Same");
    vi.advanceTimersByTime(1000);
    expect(root.publish).toHaveBeenCalledTimes(1);
    expect(modal.publish).not.toHaveBeenCalled();
  });

  it("discards queued work after the last host leaves and starts fresh later", async () => {
    const root = register("root");
    announce("Discarded");
    root.unregister();
    root.unregister();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
    announce("Without host");

    const next = register("root");
    vi.advanceTimersByTime(2000);
    expect(next.publish).not.toHaveBeenCalled();
    announce("Fresh");
    expect(next.publish).toHaveBeenCalledExactlyOnceWith("Fresh", "polite");
  });

  it("disables delivery after an activation-time publication failure without retrying", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = register("root");
    root.publish.mockImplementation(() => {
      throw new Error("Private announcement text");
    });
    announce("Private announcement text");

    expect(() => vi.advanceTimersByTime(100)).not.toThrow();
    const modal = register("modal");
    announce("Later");
    vi.runAllTimers();
    expect(root.publish).toHaveBeenCalledTimes(1);
    expect(modal.publish).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(error).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Delivery stopped after a publication error."
    );
  });

  it("contains failures in later scheduler timers and allows a fresh lifecycle after teardown", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = register("root");
    vi.advanceTimersByTime(100);
    announce("First");
    root.publish.mockImplementation(() => {
      throw new Error("Private announcement text");
    });
    announce("Fails");
    announce("Discarded");

    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    expect(() => root.unregister()).not.toThrow();
    const fresh = register("root");
    vi.advanceTimersByTime(100);
    announce("Fresh");
    expect(fresh.publish).toHaveBeenCalledExactlyOnceWith("Fresh", "polite");
    expect(root.publish).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenCalledTimes(1);
  });

  it("contains an immediate publication failure from a request", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const uncaught = vi.fn();
    window.addEventListener("error", uncaught);
    try {
      const root = register("root");
      vi.advanceTimersByTime(100);
      root.publish.mockImplementation(() => {
        throw new Error("Private announcement text");
      });
      announce("Fails");
      expect(uncaught).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledExactlyOnceWith(
        "[gcforms/announce] Delivery stopped after a publication error."
      );
    } finally {
      window.removeEventListener("error", uncaught);
    }
  });

  it("does not fall back to the root when clearing a modal host fails", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = register("root");
    vi.advanceTimersByTime(100);
    announce("First");
    announce("Pending");
    const modal = register(
      "modal",
      vi.fn(() => {
        throw new Error("Private announcement text");
      })
    );

    announce("Discarded");
    vi.runAllTimers();
    expect(root.publish).toHaveBeenCalledTimes(1);
    expect(modal.publish).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    expect(error).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Delivery stopped after a host activation error."
    );
  });

  it("finishes cleanup even when clearing the last host throws", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = register("root");
    announce("Pending");
    root.clear.mockImplementation(() => {
      throw new Error("Private announcement text");
    });

    expect(() => root.unregister()).not.toThrow();
    expect(() => root.unregister()).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
    expect(error).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Delivery stopped after a host cleanup error."
    );

    const fresh = register("root");
    vi.advanceTimersByTime(100);
    announce("Fresh");
    expect(fresh.publish).toHaveBeenCalledExactlyOnceWith("Fresh", "polite");
  });

  it("contains request-processing errors without exposing announcement content", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = register("root");
    vi.spyOn(console, "warn").mockImplementation(() => {
      throw new Error("Private announcement text");
    });
    for (let i = 0; i < 21; i++) announce(`Pending ${i}`);
    announce("Later");
    vi.runAllTimers();
    expect(root.publish).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Delivery stopped after a request processing error."
    );
  });
});
