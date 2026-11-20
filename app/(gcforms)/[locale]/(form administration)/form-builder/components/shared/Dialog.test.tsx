/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
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
          this.open = false;
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
    fireEvent(ref.current!, new Event("close"));
    act(() => announce("Outside"));
    expect(root).toHaveTextContent("Outside");
    expect(modal).toBeEmptyDOMElement();
    expect(onClose).not.toHaveBeenCalled();
  });
});
