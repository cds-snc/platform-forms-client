/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Announce, announce } from "@gcforms/announce";
import type { CDSHTMLDialogElement } from "@lib/types/form-builder-types";
import { Dialog } from "./Dialog";

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  use: vi.fn(),
}));
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  browser: vi.fn(),
}));
vi.mock("@clientComponents/globals", () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));
vi.mock("@serverComponents/icons/Close", () => ({ Close: () => <span>Close</span> }));

describe("Dialog announcement host", () => {
  const originalShowModal = Object.getOwnPropertyDescriptor(
    HTMLDialogElement.prototype,
    "showModal"
  );
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value() {
          this.open = true;
        },
      },
      close: {
        configurable: true,
        value() {
          if (!this.open) return;
          this.open = false;
          this.dispatchEvent(new Event("close"));
        },
      },
    });
  });
  afterEach(async () => {
    cleanup();
    await Promise.resolve();
    vi.clearAllTimers();
    vi.useRealTimers();
    for (const [name, descriptor] of [
      ["showModal", originalShowModal],
      ["close", originalClose],
    ] as const) {
      if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
    }
  });

  it("routes to the open dialog and restores the root after a native close", () => {
    const ref = createRef<CDSHTMLDialogElement>();
    render(
      <>
        <section data-testid="root">
          <Announce />
        </section>
        <Dialog dialogRef={ref} withAnnounce>
          <p>Modal content</p>
        </Dialog>
      </>
    );
    act(() => vi.advanceTimersByTime(100));
    act(() => announce("Inside modal"));
    expect(
      within(screen.getByTestId("dialog")).getByTestId("gc-announce-polite")
    ).toHaveTextContent("Inside modal");
    expect(
      within(screen.getByTestId("root")).getByTestId("gc-announce-polite")
    ).toBeEmptyDOMElement();

    act(() => ref.current?.close());
    act(() => announce("After close"));
    act(() => vi.advanceTimersByTime(1000));
    expect(within(screen.getByTestId("root")).getByTestId("gc-announce-polite")).toHaveTextContent(
      "After close"
    );
  });

  it("only closes the dialog receiving Escape and calls its handler once", () => {
    const outer = createRef<CDSHTMLDialogElement>();
    const inner = createRef<CDSHTMLDialogElement>();
    const onOuterClose = vi.fn();
    const onInnerClose = vi.fn();
    render(
      <>
        <Announce />
        <Dialog dialogRef={outer} handleClose={onOuterClose} withAnnounce>
          <div>
            <p>Outer</p>
            <Dialog dialogRef={inner} handleClose={onInnerClose} withAnnounce>
              <p>Inner</p>
            </Dialog>
          </div>
        </Dialog>
      </>
    );
    act(() => vi.advanceTimersByTime(100));
    const escape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    fireEvent(inner.current!, escape);
    expect(escape.defaultPrevented).toBe(true);
    expect(inner.current?.open).toBe(false);
    expect(outer.current?.open).toBe(true);
    expect(onInnerClose).toHaveBeenCalledTimes(1);
    expect(onOuterClose).not.toHaveBeenCalled();

    act(() => announce("Back to outer"));
    act(() => vi.advanceTimersByTime(100));
    expect(within(outer.current!).getAllByRole("status")[0]).toHaveTextContent("Back to outer");
  });

  it("preserves the close button callback without calling it again for the native close event", () => {
    const ref = createRef<CDSHTMLDialogElement>();
    const onClose = vi.fn();
    render(
      <Dialog dialogRef={ref} handleClose={onClose}>
        <p>Modal content</p>
      </Dialog>
    );
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(ref.current?.open).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([undefined, false])(
    "renders no announcement host when withAnnounce is %s",
    (withAnnounce) => {
      const ref = createRef<CDSHTMLDialogElement>();
      render(
        <Dialog dialogRef={ref} withAnnounce={withAnnounce}>
          <p>Modal content</p>
        </Dialog>
      );
      expect(screen.getByTestId("dialog").querySelector("[data-announce-host]")).toBeNull();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    }
  );
});
