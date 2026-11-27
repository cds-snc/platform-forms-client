/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnnounceLiveRegion } from "./AnnounceLiveRegion";
import { useAnnounce } from "./useAnnounce";

describe("useAnnounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    render(<AnnounceLiveRegion />);
  });
  afterEach(() => {
    cleanup();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it("replaces scheduled feedback and publishes only the latest message after the delay", () => {
    const region = screen.getByTestId("gc-announce-polite");
    const hook = renderHook(({ message }) => useAnnounce(message, { delay: 400 }), {
      initialProps: { message: "Old results" },
    });
    act(() => vi.advanceTimersByTime(200));
    hook.rerender({ message: "Latest results" });
    act(() => vi.advanceTimersByTime(399));
    expect(region).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(region).toHaveTextContent("Latest results");
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(["close", "unmount", "empty message"] as const)(
    "cancels scheduled feedback on %s",
    (action) => {
      const region = screen.getByTestId("gc-announce-polite");
      const hook = renderHook(
        ({ message, active }) => useAnnounce(message, { active, delay: 400 }),
        { initialProps: { message: "Results", active: true } }
      );
      act(() => vi.advanceTimersByTime(399));
      if (action === "unmount") hook.unmount();
      else {
        hook.rerender({
          message: action === "empty message" ? "" : "Results",
          active: action !== "close",
        });
      }
      act(() => vi.advanceTimersByTime(1000));
      expect(region).toBeEmptyDOMElement();
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it("restarts the debounce when resetKey changes but the message stays the same", () => {
    const region = screen.getByTestId("gc-announce-polite");
    const hook = renderHook(
      ({ query }) => useAnnounce("2 options available", { resetKey: query, delay: 400 }),
      { initialProps: { query: "a" } }
    );
    act(() => vi.advanceTimersByTime(300));
    hook.rerender({ query: "ab" });
    act(() => vi.advanceTimersByTime(399));
    expect(region).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(region).toHaveTextContent("2 options available");
  });

  it.each([false, true])(
    "skips activation feedback on mount and reopening (Strict Mode: %s)",
    (strict) => {
      const wrapper = ({ children }: { children: ReactNode }) =>
        strict ? <StrictMode>{children}</StrictMode> : <>{children}</>;
      const region = screen.getByTestId("gc-announce-polite");
      const hook = renderHook(
        ({ message, active }) =>
          useAnnounce(message, { active, skipOnActivation: true, delay: 400 }),
        { initialProps: { message: "Initial", active: true }, wrapper }
      );
      act(() => vi.advanceTimersByTime(400));
      expect(region).toBeEmptyDOMElement();
      hook.rerender({ message: "First update", active: true });
      act(() => vi.advanceTimersByTime(400));
      expect(region).toHaveTextContent("First update");
      hook.rerender({ message: "Closed", active: false });
      hook.rerender({ message: "Reopened", active: true });
      act(() => vi.advanceTimersByTime(400));
      expect(region).toHaveTextContent("First update");
      hook.rerender({ message: "Second update", active: true });
      act(() => vi.advanceTimersByTime(399));
      expect(region).toHaveTextContent("First update");
      act(() => vi.advanceTimersByTime(1));
      expect(region).toHaveTextContent("Second update");
    }
  );
});
