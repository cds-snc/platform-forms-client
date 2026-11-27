/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { publishAnnouncement, registerHost } from "./coordinator";

describe("direct announcement routing", () => {
  const cleanups: Array<() => void> = [];
  const register = (scope: "root" | "modal") => {
    const host = { scope, publish: vi.fn(), clear: vi.fn() };
    const unregister = registerHost(host);
    cleanups.push(unregister);
    return { ...host, unregister };
  };

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    for (const cleanup of cleanups.splice(0).reverse()) cleanup();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("drops host-free requests and immediately routes to one root or the latest modal", () => {
    publishAnnouncement("Before registration", "polite");
    const root = register("root");
    const secondRoot = register("root");
    expect(root.publish).not.toHaveBeenCalled();
    publishAnnouncement("Root", "polite");
    expect(root.publish).toHaveBeenCalledExactlyOnceWith("Root", "polite", undefined);
    expect(secondRoot.publish).not.toHaveBeenCalled();

    const outer = register("modal");
    const inner = register("modal");
    publishAnnouncement("Inner", "assertive", { lang: "fr" });
    expect(inner.publish).toHaveBeenCalledExactlyOnceWith("Inner", "assertive", "fr");
    inner.unregister();
    inner.unregister();
    expect(inner.clear).toHaveBeenCalledTimes(2);
    publishAnnouncement("Outer", "polite");
    expect(outer.publish).toHaveBeenCalledExactlyOnceWith("Outer", "polite", undefined);
    outer.unregister();
    publishAnnouncement("Root again", "polite");
    expect(root.publish).toHaveBeenLastCalledWith("Root again", "polite", undefined);
  });

  it("suppresses repeats until exactly one second after successful publication", () => {
    const root = register("root");
    publishAnnouncement("Same", "polite");
    vi.advanceTimersByTime(999);
    publishAnnouncement("Same", "polite");
    expect(root.publish).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    publishAnnouncement("Same", "polite");
    expect(root.publish).toHaveBeenCalledTimes(2);
  });

  it("keeps languages and priorities independent and allows duplicate overrides", () => {
    const root = register("root");
    publishAnnouncement("Menu", "polite", { lang: "en" });
    publishAnnouncement("Menu", "polite", { lang: "fr" });
    publishAnnouncement("Menu", "assertive", { lang: "fr" });
    publishAnnouncement("Menu", "polite");
    publishAnnouncement("Menu", "polite", { allowDuplicates: true });
    expect(root.publish.mock.calls).toEqual([
      ["Menu", "polite", "en"],
      ["Menu", "polite", "fr"],
      ["Menu", "assertive", "fr"],
      ["Menu", "polite", undefined],
      ["Menu", "polite", undefined],
    ]);
  });

  it("preserves history through handoffs but resets it after final teardown", () => {
    const root = register("root");
    publishAnnouncement("Same", "polite");
    const modal = register("modal");
    publishAnnouncement("Same", "polite");
    expect(modal.publish).not.toHaveBeenCalled();
    modal.unregister();
    root.unregister();
    publishAnnouncement("Without hosts", "polite");
    const nextRoot = register("root");
    expect(nextRoot.publish).not.toHaveBeenCalled();
    publishAnnouncement("Same", "polite");
    expect(nextRoot.publish).toHaveBeenCalledExactlyOnceWith("Same", "polite", undefined);
  });

  it("ignores empty and already-aborted requests without recording duplicate history", () => {
    const root = register("root");
    const controller = new AbortController();
    controller.abort();
    publishAnnouncement("", "polite");
    publishAnnouncement("Same", "polite", { signal: controller.signal });
    expect(root.publish).not.toHaveBeenCalled();
    publishAnnouncement("Same", "polite");
    expect(root.publish).toHaveBeenCalledTimes(1);
  });

  it("reports publication failures without content, retry, fallback, or success history", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = register("root");
    const modal = register("modal");
    modal.publish.mockImplementationOnce(() => {
      throw new Error("Private content");
    });
    expect(() => publishAnnouncement("Private content", "polite")).not.toThrow();
    expect(error).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Announcement publication failed."
    );
    expect(modal.publish).toHaveBeenCalledTimes(1);
    expect(root.publish).not.toHaveBeenCalled();
    publishAnnouncement("Private content", "polite");
    expect(modal.publish).toHaveBeenCalledTimes(2);
  });

  it("reports failed handoff cleanup and leaves delivery inactive", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = register("root");
    root.clear.mockImplementationOnce(() => {
      throw new Error("Private content");
    });
    const modal = register("modal");
    publishAnnouncement("Feedback", "polite");
    expect(root.publish).not.toHaveBeenCalled();
    expect(modal.publish).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledExactlyOnceWith(
      "[gcforms/announce] Announcement host cleanup failed."
    );
  });
});
