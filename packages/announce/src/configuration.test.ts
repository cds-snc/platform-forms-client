/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const cleanups: Array<() => void> = [];

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
});

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup();
  await Promise.resolve();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});

it.each([NaN, Infinity, -1, 0, 2147483648])("rejects invalid interval %s", async (interval) => {
  const { configureAnnounce } = await import("./index");
  expect(() => configureAnnounce({ publicationIntervalMs: interval })).toThrow(RangeError);
});

it("preserves custom pacing across modal handoffs and complete host teardown", async () => {
  const { configureAnnounce, announce } = await import("./index");
  const { registerHost } = await import("./coordinator");
  configureAnnounce({ publicationIntervalMs: 3000 });
  const root = { scope: "root" as const, publish: vi.fn(), clear: vi.fn() };
  const unregisterRoot = registerHost(root);
  cleanups.push(unregisterRoot);
  vi.advanceTimersByTime(100);
  announce("First");
  announce("Second");
  vi.advanceTimersByTime(400);
  const modal = { scope: "modal" as const, publish: vi.fn(), clear: vi.fn() };
  const unregisterModal = registerHost(modal);
  cleanups.push(unregisterModal);
  vi.advanceTimersByTime(2599);
  expect(modal.publish).not.toHaveBeenCalled();
  vi.advanceTimersByTime(1);
  expect(modal.publish).toHaveBeenCalledExactlyOnceWith("Second", "polite");
  unregisterModal();
  unregisterRoot();
  await Promise.resolve();
  cleanups.push(registerHost(root));
  vi.advanceTimersByTime(100);
  announce("Third");
  announce("Fourth");
  vi.advanceTimersByTime(2999);
  expect(root.publish).toHaveBeenCalledTimes(2);
  vi.advanceTimersByTime(1);
  expect(root.publish).toHaveBeenLastCalledWith("Fourth", "polite");
});

it.each(["host", "request"] as const)("locks configuration after the first %s", async (start) => {
  const { configureAnnounce, announce } = await import("./index");
  const { registerHost } = await import("./coordinator");
  configureAnnounce({ publicationIntervalMs: 3000 });
  if (start === "request") announce("Early");
  cleanups.push(registerHost({ scope: "root", publish: vi.fn(), clear: vi.fn() }));
  expect(() => configureAnnounce({ publicationIntervalMs: 3000 })).not.toThrow();
  expect(() => configureAnnounce({ publicationIntervalMs: 6000 })).toThrow(
    "Configure spacing before mounting hosts or announcing"
  );
  for (const cleanup of cleanups.splice(0)) cleanup();
  await Promise.resolve();
  expect(() => configureAnnounce({ publicationIntervalMs: 6000 })).toThrow();
});
