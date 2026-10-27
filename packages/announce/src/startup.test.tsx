/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode, useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("announcement startup", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
  });

  afterEach(async () => {
    cleanup();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each([false, true])(
    "retains early requests and mount-effect announcements (Strict Mode: %s)",
    async (strict) => {
      const { Announce, announce } = await import("./index");
      announce("Before mounting");
      function Requester() {
        useEffect(() => {
          announce("From mount effect");
        }, []);
        return null;
      }
      const content = (
        <>
          <Requester />
          <Announce />
        </>
      );
      render(strict ? <StrictMode>{content}</StrictMode> : content);
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
      act(() => vi.advanceTimersByTime(99));
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByRole("status")).toHaveTextContent("Before mounting");
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByRole("status")).toHaveTextContent("From mount effect");
      act(() => vi.advanceTimersByTime(1000));
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it("bounds and prioritizes startup requests using the existing scheduler", async () => {
    const { Announce, announce, Priority } = await import("./index");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (let i = 0; i < 21; i++) announce(`Message ${i}`);
    announce("Urgent", Priority.HIGH);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
    render(<Announce />);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByRole("alert")).toHaveTextContent("Urgent");
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("status")).toHaveTextContent("Message 2");
    act(() => vi.runAllTimers());
    expect(screen.getByRole("status")).toHaveTextContent("Message 20");
  });

  it("does not queue server calls or install window event listeners", async () => {
    const { Announce, announce } = await import("./index");
    vi.stubGlobal("window", undefined);
    try {
      announce("From server");
    } finally {
      vi.unstubAllGlobals();
    }
    const addListener = vi.spyOn(window, "addEventListener");
    announce("");
    render(<Announce />);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(addListener.mock.calls.some(([name]) => name.startsWith("gc-announce-"))).toBe(false);
  });
});
