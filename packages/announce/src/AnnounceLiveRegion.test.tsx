/**
 * @vitest-environment jsdom
 */
import { act, cleanup, render, screen } from "@testing-library/react";
import { StrictMode, useEffect } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { AnnounceLiveRegion, Priority } from "./AnnounceLiveRegion";
import { announce } from "./announce";

afterEach(() => cleanup());

describe("live-region publication", () => {
  it.each([Priority.LOW, Priority.HIGH])(
    "alternates successive identical %s requests between mounted regions",
    (priority) => {
      render(<AnnounceLiveRegion />);
      const primary = screen.getByTestId(`gc-announce-${priority}`);
      const alternate = screen.getByTestId(`gc-announce-${priority}-alternate`);

      for (const receivingRegion of [primary, alternate, primary]) {
        act(() => announce("Saved", priority, { allowDuplicates: true, lang: "fr" }));
        const otherRegion = receivingRegion === primary ? alternate : primary;
        expect(receivingRegion).toHaveTextContent("Saved");
        expect(receivingRegion).toHaveAttribute("lang", "fr");
        expect(otherRegion).toBeEmptyDOMElement();
        expect(otherRegion).not.toHaveAttribute("lang");
        expect(screen.getByTestId(`gc-announce-${priority}`)).toBe(primary);
        expect(screen.getByTestId(`gc-announce-${priority}-alternate`)).toBe(alternate);
      }
    }
  );

  it.each([Priority.LOW, Priority.HIGH])(
    "restores inherited language after explicit %s language on either region",
    (priority) => {
      render(
        <section lang="en">
          <AnnounceLiveRegion />
        </section>
      );
      const primary = screen.getByTestId(`gc-announce-${priority}`);
      const alternate = screen.getByTestId(`gc-announce-${priority}-alternate`);

      act(() => announce("Menu", priority, { lang: "fr" }));
      expect(primary).toHaveAttribute("lang", "fr");
      act(() => announce("Menu", priority));
      expect(alternate).toHaveTextContent("Menu");
      expect(alternate).not.toHaveAttribute("lang");
      expect(alternate.closest("[lang]")).toHaveAttribute("lang", "en");
      expect(primary).toBeEmptyDOMElement();
      expect(primary).not.toHaveAttribute("lang");

      act(() => announce("Menu", priority, { lang: "fr" }));
      expect(primary).toHaveAttribute("lang", "fr");
      act(() => announce("Different message", priority));
      expect(primary).toHaveTextContent("Different message");
      expect(primary).not.toHaveAttribute("lang");
      expect(primary.closest("[lang]")).toHaveAttribute("lang", "en");
    }
  );

  it.each(["deactivate", "unmount"] as const)(
    "clears modal content and language and restores root delivery on %s",
    (action) => {
      render(<AnnounceLiveRegion />);
      const root = screen.getByTestId("gc-announce-polite");
      act(() => announce("Root", Priority.LOW, { lang: "en" }));
      const modal = render(<AnnounceLiveRegion scope="modal" />);
      expect(root).toBeEmptyDOMElement();
      expect(root).not.toHaveAttribute("lang");
      const modalRegions = Array.from(modal.container.querySelectorAll<HTMLElement>("[aria-live]"));
      const [polite, alternatePolite, assertive, alternateAssertive] = modalRegions;
      act(() => {
        announce("Modal", Priority.LOW, { lang: "fr" });
        announce("Modal", Priority.LOW, { lang: "fr", allowDuplicates: true });
        announce("Urgent", Priority.HIGH, { lang: "fr" });
        announce("Urgent", Priority.HIGH, { lang: "fr", allowDuplicates: true });
      });
      expect(alternatePolite).toHaveTextContent("Modal");
      expect(alternateAssertive).toHaveTextContent("Urgent");
      act(() => {
        announce("Another update", Priority.LOW, { lang: "fr" });
        announce("Another urgent update", Priority.HIGH, { lang: "fr" });
      });
      expect(polite).toHaveTextContent("Another update");
      expect(assertive).toHaveTextContent("Another urgent update");

      if (action === "unmount") modal.unmount();
      else modal.rerender(<AnnounceLiveRegion scope="modal" active={false} />);

      for (const region of modalRegions) {
        expect(region).toBeEmptyDOMElement();
        expect(region).not.toHaveAttribute("lang");
      }
      act(() => announce("Back to root"));
      expect(root).toHaveTextContent("Back to root");
      for (const region of modalRegions) expect(region).toBeEmptyDOMElement();
    }
  );

  it.each([false, true])(
    "registers before passive requests on initial mount and remount (Strict Mode: %s)",
    (strict) => {
      function Requester() {
        useEffect(() => {
          announce("Mounted", Priority.LOW, { allowDuplicates: true });
        }, []);
        return null;
      }
      for (const scope of ["root", "modal"] as const) {
        for (let mount = 0; mount < 2; mount++) {
          const content = (
            <>
              <Requester />
              <AnnounceLiveRegion scope={scope} />
            </>
          );
          const view = render(strict ? <StrictMode>{content}</StrictMode> : content);
          const regions = view.container.querySelectorAll('[aria-live="polite"]');
          expect(Array.from(regions, (region) => region.textContent).join("")).toBe("Mounted");
          view.unmount();
          for (const region of regions) expect(region).toBeEmptyDOMElement();
        }
      }
    }
  );
});
