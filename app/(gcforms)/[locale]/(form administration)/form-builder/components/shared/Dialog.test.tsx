/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnnounceLiveRegion, announce } from "@gcforms/announce";
import { CDSHTMLDialogElement } from "@lib/types/form-builder-types";
import { Dialog } from "./Dialog";

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  use: vi.fn(),
}));
vi.mock("react-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-dom")>()),
  browser: vi.fn(),
}));

describe("Dialog announcement opt-in", () => {
  const originalShowModal = Object.getOwnPropertyDescriptor(
    HTMLDialogElement.prototype,
    "showModal"
  );
  const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
  beforeEach(() => {
    Object.defineProperties(HTMLDialogElement.prototype, {
      showModal: {
        configurable: true,
        value(this: HTMLDialogElement) {
          this.open = true;
        },
      },
      close: {
        configurable: true,
        value(this: HTMLDialogElement) {
          if (!this.open) return;
          this.open = false;
          this.dispatchEvent(new Event("close"));
        },
      },
    });
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    for (const [name, descriptor] of [
      ["showModal", originalShowModal],
      ["close", originalClose],
    ] as const) {
      if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
    }
  });

  it("adds no host by default", () => {
    render(
      <Dialog dialogRef={createRef<CDSHTMLDialogElement>()}>
        <p>Content</p>
      </Dialog>
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it.each([
    { withAnnounce: false, stopPropagation: false },
    { withAnnounce: false, stopPropagation: true },
    { withAnnounce: true, stopPropagation: false },
    { withAnnounce: true, stopPropagation: true },
  ])(
    "lets a child consume Escape before closing (host: $withAnnounce, stop propagation: $stopPropagation)",
    ({ withAnnounce, stopPropagation }) => {
      const ref = createRef<CDSHTMLDialogElement>();
      const onClose = vi.fn();
      const onPopupClose = vi.fn();
      function Popup() {
        const [expanded, setExpanded] = useState(true);
        return (
          <button
            aria-expanded={expanded}
            onKeyDown={(event) => {
              if (event.key === "Escape" && expanded) {
                event.preventDefault();
                if (stopPropagation) event.stopPropagation();
                setExpanded(false);
                onPopupClose();
              }
            }}
          >
            Popup control
          </button>
        );
      }
      render(
        <Dialog dialogRef={ref} handleClose={onClose} withAnnounce={withAnnounce}>
          <Popup />
        </Dialog>
      );
      const control = screen.getByRole("button", { name: "Popup control" });
      fireEvent.keyDown(control, { key: "Escape" });
      expect(onPopupClose).toHaveBeenCalledTimes(1);
      expect(control).toHaveAttribute("aria-expanded", "false");
      expect(ref.current?.open).toBe(true);
      expect(onClose).not.toHaveBeenCalled();

      const escape = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      });
      fireEvent(control, escape);
      expect(escape.defaultPrevented).toBe(true);
      expect(ref.current?.open).toBe(false);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onPopupClose).toHaveBeenCalledTimes(1);
    }
  );

  it("does not prevent unrelated keys or close the dialog", () => {
    const ref = createRef<CDSHTMLDialogElement>();
    const onClose = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <Dialog dialogRef={ref} handleClose={onClose}>
        <input aria-label="Input" onKeyDown={onKeyDown} />
      </Dialog>
    );
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    fireEvent(screen.getByRole("textbox"), event);
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(false);
    expect(ref.current?.open).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it.each(["Escape", "close button"] as const)(
    "closes only the current nested dialog via %s and restores each previous host",
    (method) => {
      const outer = createRef<CDSHTMLDialogElement>();
      const inner = createRef<CDSHTMLDialogElement>();
      const onOuterClose = vi.fn();
      const onInnerClose = vi.fn();
      function NestedDialogs() {
        const [innerOpen, setInnerOpen] = useState(false);
        return (
          <>
            <AnnounceLiveRegion />
            <Dialog dialogRef={outer} handleClose={onOuterClose} withAnnounce>
              <div>
                <button onClick={() => setInnerOpen(true)}>Open inner</button>
                {innerOpen && (
                  <Dialog dialogRef={inner} handleClose={onInnerClose} withAnnounce>
                    <input aria-label="Inner input" />
                  </Dialog>
                )}
              </div>
            </Dialog>
          </>
        );
      }
      render(<NestedDialogs />);
      fireEvent.click(screen.getByRole("button", { name: "Open inner" }));
      const rootRegion = screen.getAllByTestId("gc-announce-polite")[0];
      const outerRegion = within(outer.current!).getAllByTestId("gc-announce-polite").at(-1)!;
      const innerRegion = within(inner.current!).getByTestId("gc-announce-polite");
      act(() => announce("Inner feedback"));
      expect(innerRegion).toHaveTextContent("Inner feedback");
      expect(outerRegion).toBeEmptyDOMElement();
      expect(rootRegion).toBeEmptyDOMElement();

      if (method === "Escape") {
        const escape = new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        });
        fireEvent(screen.getByRole("textbox"), escape);
        expect(escape.defaultPrevented).toBe(true);
      } else {
        fireEvent.click(within(inner.current!).getByTestId("close-dialog"));
      }
      expect(inner.current?.open).toBe(false);
      expect(outer.current?.open).toBe(true);
      expect(onInnerClose).toHaveBeenCalledTimes(1);
      expect(onOuterClose).not.toHaveBeenCalled();
      act(() => announce("Outer feedback"));
      expect(innerRegion).toBeEmptyDOMElement();
      expect(outerRegion).toHaveTextContent("Outer feedback");
      expect(rootRegion).toBeEmptyDOMElement();

      fireEvent.click(within(outer.current!).getAllByTestId("close-dialog").at(-1)!);
      expect(onOuterClose).toHaveBeenCalledTimes(1);
      expect(onInnerClose).toHaveBeenCalledTimes(1);
      expect(outer.current?.open).toBe(false);
      act(() => announce("Root feedback"));
      expect(outerRegion).toBeEmptyDOMElement();
      expect(rootRegion).toHaveTextContent("Root feedback");
    }
  );

  it("publishes inside an opted-in dialog and restores root delivery on native close", () => {
    const ref = createRef<CDSHTMLDialogElement>();
    const onClose = vi.fn();
    render(
      <>
        <AnnounceLiveRegion />
        <Dialog dialogRef={ref} handleClose={onClose} withAnnounce>
          <p>Content</p>
        </Dialog>
      </>
    );
    const [root, modal] = screen.getAllByTestId("gc-announce-polite");
    act(() => announce("Inside"));
    expect(modal).toHaveTextContent("Inside");
    expect(root).toBeEmptyDOMElement();
    act(() => ref.current?.close());
    act(() => announce("Outside"));
    expect(root).toHaveTextContent("Outside");
    expect(modal).toBeEmptyDOMElement();
    expect(onClose).not.toHaveBeenCalled();
  });
});
