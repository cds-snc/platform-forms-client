/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode, type ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Announce, Priority } from "./AnnounceLiveRegions";
import { announce } from "./announce";

function renderReadyHost(element: ReactElement = <Announce />) {
  const host = render(element);
  act(() => vi.advanceTimersByTime(100));
  return host;
}

describe("Announce", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(async () => {
    cleanup();
    await Promise.resolve();
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

  it("visually hides all live regions without hiding them from assistive technology", () => {
    renderReadyHost();

    const [polite, alternatePolite] = screen.getAllByRole("status");
    const [assertive, alternateAssertive] = screen.getAllByRole("alert");
    const host = polite.parentElement!;
    expect(assertive.parentElement).toBe(host);
    expect(host).toHaveAttribute("data-announce-host", "root");
    expect(host).toHaveStyle({
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

    for (const element of [host, polite, alternatePolite, assertive, alternateAssertive]) {
      expect(element).not.toHaveAttribute("aria-hidden");
      expect(element).not.toHaveAttribute("hidden");
      expect(element).not.toHaveStyle({ display: "none" });
      expect(element).not.toHaveStyle({ visibility: "hidden" });
    }

    expect(polite).toHaveAttribute("aria-live", "polite");
    expect(assertive).toHaveAttribute("aria-live", "assertive");
    expect(alternatePolite.parentElement).toBe(host);
    expect(alternateAssertive.parentElement).toBe(host);
    expect(alternatePolite).toHaveAttribute("aria-live", "polite");
    expect(alternateAssertive).toHaveAttribute("aria-live", "assertive");
    for (const region of [polite, alternatePolite, assertive, alternateAssertive]) {
      expect(region).toHaveAttribute("aria-atomic", "true");
      expect(region).toBeEmptyDOMElement();
    }
  });

  it.each([Priority.LOW, Priority.HIGH])(
    "alternates repeated %s messages only when the incoming request allows duplicates",
    (priority) => {
      renderReadyHost(
        <StrictMode>
          <Announce />
        </StrictMode>
      );
      const primary = screen.getByTestId(`gc-announce-${priority}`);
      const alternate = screen.getByTestId(`gc-announce-${priority}-alternate`);
      act(() => {
        announce("Same", priority);
        announce("Same", priority, { allowDuplicates: true });
        announce("Same", priority, { allowDuplicates: true });
        announce("Same", priority, { allowDuplicates: false });
        announce("Same", priority);
      });
      expect(primary).toHaveTextContent("Same");
      expect(alternate).toBeEmptyDOMElement();
      act(() => vi.advanceTimersByTime(999));
      expect(primary).toHaveTextContent("Same");
      act(() => vi.advanceTimersByTime(1));
      expect(primary).toBeEmptyDOMElement();
      expect(alternate).toHaveTextContent("Same");
      act(() => vi.advanceTimersByTime(1000));
      expect(primary).toHaveTextContent("Same");
      expect(alternate).toBeEmptyDOMElement();
      act(() => vi.advanceTimersByTime(1000));
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it("clears alternate regions on handoff and retains a pending allowed duplicate", () => {
    const view = (active: boolean) => (
      <>
        <section data-testid="root-host">
          <Announce />
        </section>
        <section data-testid="modal-host">
          <Announce scope="modal" active={active} />
        </section>
      </>
    );
    const host = renderReadyHost(view(false));
    const root = screen.getByTestId("root-host");
    const modal = screen.getByTestId("modal-host");
    act(() => {
      announce("Same");
      announce("Same", Priority.LOW, { allowDuplicates: true });
      vi.advanceTimersByTime(1000);
    });
    expect(root.querySelector('[data-testid="gc-announce-polite-alternate"]')).toHaveTextContent(
      "Same"
    );
    act(() => announce("Same", Priority.LOW, { allowDuplicates: true }));
    host.rerender(view(true));
    expect(root.textContent).toBe("");
    act(() => vi.advanceTimersByTime(1000));
    expect(modal.querySelector('[data-testid="gc-announce-polite"]')).toHaveTextContent("Same");
    host.rerender(view(false));
    expect(modal.textContent).toBe("");
    act(() => vi.advanceTimersByTime(1000));
    expect(root.textContent).toBe("");
  });

  it("keeps the public API and live-region hosts while pacing publications", () => {
    renderReadyHost();
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
    const host = renderReadyHost();
    act(() => {
      announce("First");
      announce("Pending");
      vi.advanceTimersByTime(500);
    });
    host.rerender(<Announce />);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Pending");
  });

  it("cleans up on unmount and starts fresh on remount", async () => {
    const host = renderReadyHost();
    const oldRegion = screen.getByTestId("gc-announce-polite");
    act(() => {
      announce("First");
      announce("Stale");
    });
    host.unmount();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
    announce("While unmounted");
    renderReadyHost();
    act(() => vi.runAllTimers());
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    expect(oldRegion).toHaveTextContent("First");
    act(() => announce("Fresh"));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("Fresh");
  });

  it("survives Strict Mode effect cleanup without duplicate publications or stale timers", async () => {
    renderReadyHost(
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
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("ignores empty messages and consecutive duplicates", () => {
    renderReadyHost();
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

  it("keeps an initially mounted host empty for 100 ms while retaining incoming requests", () => {
    render(<Announce />);
    act(() => announce("After activation"));
    act(() => vi.advanceTimersByTime(99));
    expect(screen.getByTestId("gc-announce-polite")).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByTestId("gc-announce-polite")).toHaveTextContent("After activation");
  });

  it("routes to active modal regions and restores the root without replaying text", () => {
    const view = (active: boolean) => (
      <>
        <section data-testid="root-host">
          <Announce />
        </section>
        <section data-testid="modal-host">
          <Announce scope="modal" active={active} />
        </section>
      </>
    );
    const host = renderReadyHost(view(false));
    const root = screen.getByTestId("root-host").querySelector('[role="status"]')!;
    const modal = screen.getByTestId("modal-host").querySelector('[role="status"]')!;

    act(() => announce("Root message"));
    expect(root).toHaveTextContent("Root message");
    host.rerender(view(true));
    expect(root).toBeEmptyDOMElement();
    act(() => announce("Modal message"));
    act(() => vi.advanceTimersByTime(1000));
    expect(modal).toHaveTextContent("Modal message");
    expect(root).toBeEmptyDOMElement();

    host.rerender(view(false));
    expect(modal).toBeEmptyDOMElement();
    act(() => vi.advanceTimersByTime(1000));
    expect(root).toBeEmptyDOMElement();
    // This text was last present in the root, but must still cause a fresh update after handoff.
    act(() => announce("Root message"));
    expect(root).toHaveTextContent("Root message");
  });
});
