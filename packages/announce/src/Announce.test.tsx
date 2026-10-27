/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Announce, Priority } from "./Announce";
import { announce } from "../utils/announce";

describe("Announce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders empty live regions on the server", () => {
    const html = renderToString(<Announce />);
    expect(html).toContain('role="status"');
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('aria-live="assertive"');
    expect(vi.getTimerCount()).toBe(0);
  });

  it("visually hides both live regions without hiding them from assistive technology", () => {
    render(<Announce />);

    for (const role of ["status", "alert"]) {
      const region = screen.getByRole(role);
      expect(region).toHaveStyle({
        clip: "rect(0px, 0px, 0px, 0px)",
        whiteSpace: "nowrap",
        borderWidth: "0px",
        width: "1px",
        height: "1px",
        margin: "-1px",
        padding: "0px",
        position: "absolute",
        overflow: "hidden",
      });
      expect(region).not.toHaveAttribute("aria-hidden");
      expect(region).not.toHaveAttribute("hidden");
      expect(region).not.toHaveStyle({ display: "none" });
      expect(region).not.toHaveStyle({ visibility: "hidden" });
    }
  });

  it("keeps the public API and live-region hosts while pacing publications", () => {
    render(<Announce />);
    const polite = screen.getByTestId("gc-announce-polite");
    const assertive = screen.getByTestId("gc-announce-assertive");
    expect(polite).toBeEmptyDOMElement();
    expect(assertive).toBeEmptyDOMElement();

    act(() => {
      announce("First");
      announce("Second", Priority.LOW);
    });
    expect(polite).toHaveTextContent("First");
    act(() => vi.advanceTimersByTime(1000));
    expect(polite).toHaveTextContent("Second");

    act(() => {
      announce("Third");
      announce("Urgent", Priority.HIGH);
      announce("Urgent second", Priority.HIGH);
    });
    expect(polite).toHaveTextContent("Second");
    expect(assertive).toHaveTextContent("Urgent");
    act(() => vi.advanceTimersByTime(1000));
    expect(assertive).toHaveTextContent("Urgent second");
    act(() => vi.advanceTimersByTime(1000));
    expect(polite).toHaveTextContent("Third");
    expect(screen.getByTestId("gc-announce-polite")).toBe(polite);
    expect(screen.getByTestId("gc-announce-assertive")).toBe(assertive);
  });

  it("does not reset the scheduler when the host rerenders", () => {
    const host = render(<Announce />);
    act(() => {
      announce("First");
      announce("Pending");
      vi.advanceTimersByTime(500);
    });
    host.rerender(<Announce />);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Pending");
  });

  it("cleans up on unmount and starts fresh on remount", () => {
    const host = render(<Announce />);
    const oldRegion = screen.getByTestId("gc-announce-polite");
    act(() => {
      announce("First");
      announce("Stale");
    });
    host.unmount();
    expect(vi.getTimerCount()).toBe(0);
    announce("While unmounted");
    render(<Announce />);
    act(() => vi.runAllTimers());
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    expect(oldRegion).toHaveTextContent("First");
    act(() => announce("Fresh"));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Fresh");
  });

  it("survives Strict Mode effect cleanup without duplicate listeners or stale timers", () => {
    render(
      <StrictMode>
        <Announce />
      </StrictMode>
    );
    act(() => {
      announce("First");
      announce("Second");
    });
    expect(vi.getTimerCount()).toBe(1);
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("First");
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Second");
    cleanup();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("ignores requests before mounting, empty messages, and consecutive duplicates", () => {
    announce("Before mounting");
    render(<Announce />);
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    act(() => {
      announce("");
      announce("Same");
      announce("Same");
    });
    act(() => vi.runAllTimers());
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Same");
    expect(vi.getTimerCount()).toBe(0);
  });
});
