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
      expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
      act(() => vi.advanceTimersByTime(99));
      expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
      act(() => vi.advanceTimersByTime(1));
      expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Before mounting");
      act(() => vi.advanceTimersByTime(1000));
      expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("From mount effect");
      act(() => vi.advanceTimersByTime(1000));
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it.each([
    { scope: "root", strict: false },
    { scope: "root", strict: true },
    { scope: "modal", strict: false },
    { scope: "modal", strict: true },
  ] as const)(
    "retains mount-effect requests on repeated $scope mounts (Strict Mode: $strict)",
    async ({ scope, strict }) => {
      const { Announce, announce } = await import("./index");
      function Requester({ message }: { message: string }) {
        useEffect(() => {
          announce(message);
        }, [message]);
        return null;
      }

      for (const message of ["First mount", "Second mount", "Third mount"]) {
        const content = (
          <>
            <Requester message={message} />
            <Announce scope={scope} />
          </>
        );
        const host = render(strict ? <StrictMode>{content}</StrictMode> : content);
        const region = screen.getByTestId("gc-announce-polite");
        act(() => vi.advanceTimersByTime(99));
        expect(region).toBeEmptyDOMElement();
        act(() => vi.advanceTimersByTime(1));
        expect(region).toHaveTextContent(message);
        act(() => vi.advanceTimersByTime(1000));
        expect(region).toHaveTextContent(message);
        expect(vi.getTimerCount()).toBe(0);

        announce("Before leaving");
        announce("Discarded pending feedback");
        host.unmount();
        announce("Without a host before disposal");
        // eslint-disable-next-line no-await-in-loop -- Let teardown finish before mounting again.
        await Promise.resolve();
        expect(vi.getTimerCount()).toBe(0);
        announce("Without a host after disposal");
      }
    }
  );

  it("registers a reactivated host before newly mounted requesters' effects", async () => {
    const { Announce, announce } = await import("./index");
    function Requester() {
      useEffect(() => {
        announce("After reactivation");
      }, []);
      return null;
    }
    const view = (active: boolean) => (
      <>
        {active && <Requester />}
        <Announce active={active} />
      </>
    );
    const host = render(view(true));
    act(() => vi.advanceTimersByTime(100));
    host.rerender(view(false));
    await Promise.resolve();
    announce("While inactive");
    host.rerender(view(true));
    act(() => vi.advanceTimersByTime(99));
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("After reactivation");
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("After reactivation");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("bounds and prioritizes startup requests using the existing scheduler", async () => {
    const { Announce, announce, Priority } = await import("./index");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (let i = 0; i < 21; i++) announce(`Message ${i}`);
    announce("Urgent", Priority.HIGH);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
    render(<Announce />);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByTestId("gc-announce-assertive")).toHaveTextContent("Urgent");
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Message 2");
    act(() => vi.runAllTimers());
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Message 20");
  });

  it("cancels a startup request before its first host is ready", async () => {
    const { Announce, announce, Priority } = await import("./index");
    const controller = new AbortController();
    announce("Stale startup feedback", Priority.LOW, {
      allowDuplicates: true,
      signal: controller.signal,
    });
    controller.abort();
    render(<Announce />);
    act(() => vi.advanceTimersByTime(100));
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    expect(screen.getByTestId("gc-announce-polite-alternate")).toBeEmptyDOMElement();
    expect(vi.getTimerCount()).toBe(0);
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
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    expect(addListener.mock.calls.some(([name]) => name.startsWith("gc-announce-"))).toBe(false);
  });
});
