/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Announce, announce, Priority, useAnnounce, type UseAnnounceOptions } from "./index";

function Host({ children }: { children: ReactNode }) {
  return (
    <>
      <Announce />
      {children}
    </>
  );
}

function StrictHost({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <Host>{children}</Host>
    </StrictMode>
  );
}

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const text = (priority: Priority = Priority.LOW) =>
  screen
    .getAllByRole(priority === Priority.HIGH ? "alert" : "status")
    .map((region) => region.textContent)
    .join("");

describe("useAnnounce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(async () => {
    cleanup();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("announces polite feedback by default without rendering its own markup", () => {
    renderHook(() => useAnnounce("Ready"), { wrapper: Host });
    expect(screen.getAllByRole("status")).toHaveLength(2);
    advance(100);
    expect(text()).toBe("Ready");
  });

  it("does not schedule announcements during server rendering", () => {
    function Feedback() {
      useAnnounce("From server");
      return null;
    }
    expect(renderToString(<Feedback />)).toBe("");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("restarts the debounce for a changed message, but not a fresh equivalent options object", () => {
    const hook = renderHook(({ message }) => useAnnounce(message, { delay: 400 }), {
      initialProps: { message: "First" },
      wrapper: Host,
    });
    advance(300);
    hook.rerender({ message: "Second" });
    advance(300);
    hook.rerender({ message: "Second" });
    advance(99);
    expect(text()).toBe("");
    advance(1);
    expect(text()).toBe("Second");
  });

  it.each([Host, StrictHost])("supports activation suppression with %s", (wrapper) => {
    const hook = renderHook(
      ({ message, active }) => useAnnounce(message, { active, skipOnActivation: true, delay: 400 }),
      { initialProps: { message: "Opening", active: true }, wrapper }
    );
    advance(2000);
    expect(text()).toBe("");
    hook.rerender({ message: "Changed", active: true });
    advance(400);
    expect(text()).toBe("Changed");
    hook.rerender({ message: "Inactive", active: false });
    hook.rerender({ message: "Reopening", active: true });
    advance(2000);
    expect(text()).toBe("Changed");
    hook.rerender({ message: "After reopening", active: true });
    advance(400);
    expect(text()).toBe("After reopening");
  });

  it("announces upon activation unless suppression is explicitly enabled", () => {
    const hook = renderHook(({ active }) => useAnnounce("Ready", { active }), {
      initialProps: { active: false },
      wrapper: StrictHost,
    });
    advance(100);
    expect(text()).toBe("");
    hook.rerender({ active: true });
    advance(0);
    expect(text()).toBe("Ready");
  });

  it("uses resetKey to debounce unchanged messages and publish allowed duplicates", () => {
    const hook = renderHook(
      ({ resetKey }) => useAnnounce("Same count", { resetKey, delay: 400, allowDuplicates: true }),
      { initialProps: { resetKey: "a" }, wrapper: StrictHost }
    );
    advance(300);
    hook.rerender({ resetKey: "ab" });
    advance(399);
    expect(text()).toBe("");
    advance(1);
    expect(text()).toBe("Same count");
    hook.rerender({ resetKey: "abc" });
    advance(1000);
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    expect(screen.getByTestId("gc-announce-polite-alternate")).toHaveTextContent("Same count");
  });

  it("forwards priority and cancels pending requests when options change", () => {
    const options: UseAnnounceOptions = { active: false };
    const hook = renderHook(
      ({ options }: { options: UseAnnounceOptions }) => useAnnounce("Feedback", options),
      { initialProps: { options }, wrapper: Host }
    );
    advance(100);
    act(() => {
      announce("Busy", Priority.HIGH);
      announce("Still busy", Priority.HIGH);
    });
    hook.rerender({ options: { delay: 100 } });
    advance(100);
    hook.rerender({ options: { delay: 200, priority: Priority.HIGH } });
    advance(200);
    advance(2700);
    expect(text()).toBe("");
    expect(text(Priority.HIGH)).toBe("Feedback");
  });

  it("forwards the requested language and restores inheritance when it is omitted", () => {
    const initialProps: { lang?: string } = { lang: "fr" };
    const hook = renderHook(({ lang }) => useAnnounce("Menu", { lang }), {
      initialProps,
      wrapper: Host,
    });
    advance(100);
    expect(screen.getByTestId("gc-announce-polite")).toHaveAttribute("lang", "fr");
    hook.rerender({ lang: undefined });
    advance(1000);
    const alternate = screen.getByTestId("gc-announce-polite-alternate");
    expect(alternate).toHaveTextContent("Menu");
    expect(alternate).not.toHaveAttribute("lang");
  });

  it("replaces queued feedback when only its language changes", () => {
    render(<Announce />);
    advance(100);
    act(() => {
      announce("Busy", Priority.HIGH);
      announce("Still busy", Priority.HIGH);
    });
    const hook = renderHook(({ lang }) => useAnnounce("Menu", { lang }), {
      initialProps: { lang: "en" },
    });
    advance(0);
    hook.rerender({ lang: "fr" });
    advance(2000);
    const primary = screen.getByTestId("gc-announce-polite");
    expect(primary).toHaveTextContent("Menu");
    expect(primary).toHaveAttribute("lang", "fr");
    advance(1000);
    expect(screen.getByTestId("gc-announce-polite-alternate")).toBeEmptyDOMElement();
  });

  it("keeps another hook's identical pending feedback when the first hook unmounts", () => {
    render(<Announce />);
    const first = renderHook(() => useAnnounce("Ready"));
    renderHook(() => useAnnounce("Ready"));
    advance(0);
    first.unmount();
    advance(100);
    expect(text()).toBe("Ready");
  });

  it.each(["inactive", "empty", "unmount"])(
    "cancels its queued request on %s without affecting other callers",
    (reason) => {
      render(<Announce />);
      const hook = renderHook(
        ({ message, active }) => useAnnounce(message, { active, delay: 100 }),
        { initialProps: { message: "Stale", active: false } }
      );
      advance(100);
      act(() => {
        announce("Busy", Priority.HIGH);
        announce("Still busy", Priority.HIGH);
      });
      hook.rerender({ message: "Stale", active: true });
      advance(100);
      if (reason === "unmount") {
        hook.unmount();
      } else {
        hook.rerender({
          message: reason === "empty" ? "" : "Stale",
          active: reason !== "inactive",
        });
      }
      act(() => announce("Other caller"));
      advance(3000);
      expect(text()).toBe("Other caller");
    }
  );

  it.each([-1, Infinity, NaN])(
    "reports an invalid delay of %s without scheduling feedback",
    (delay) => {
      const error = vi.spyOn(console, "error").mockImplementation(() => {});
      renderHook(() => useAnnounce("Private message", { delay }), { wrapper: Host });
      advance(100);
      expect(text()).toBe("");
      expect(error).toHaveBeenCalledExactlyOnceWith(
        "[gcforms/announce] Announcement delay must be a non-negative finite number."
      );
    }
  );
});
