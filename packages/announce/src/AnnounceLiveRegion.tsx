"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { registerHost } from "./coordinator";

const visuallyHiddenStyle: CSSProperties = {
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  position: "absolute",
  overflow: "hidden",
};

export const Priority = {
  LOW: "polite",
  HIGH: "assertive",
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

/**
 * Example:
 * In a top level component near the layout add:
 * import { AnnounceLiveRegion } from "@gcforms/announce";
 * ...
 * <AnnounceLiveRegion />
 *
 * Then in any component you can use:
 * import { announce } from "@gcforms/announce";
 * ...
 * announce("Your message here");
 */
export const AnnounceLiveRegion = ({
  scope = "root",
  active = true,
}: {
  scope?: "root" | "modal";
  active?: boolean;
}) => {
  const alternateLowRef = useRef<HTMLDivElement>(null);
  const alternateHighRef = useRef<HTMLDivElement>(null);
  const messageLowRef = useRef<HTMLDivElement>(null);
  const messageHighRef = useRef<HTMLDivElement>(null);

  // Route each message to one active host instead of broadcasting to every host.
  // Requests made before a host registers are still dropped. There's no startup buffer.

  useLayoutEffect(() => {
    if (!active) return;

    const updateLiveRegion = (message: string, priority: Priority, lang?: string) => {
      const primaryRegion =
        priority === Priority.HIGH ? messageHighRef.current : messageLowRef.current;
      const alternateRegion =
        priority === Priority.HIGH ? alternateHighRef.current : alternateLowRef.current;

      if (primaryRegion && alternateRegion) {
        // Identical text needs a different, already-mounted region to create a fresh update
        const repeatsPrimaryText = primaryRegion.textContent === message;
        const receivingRegion = repeatsPrimaryText ? alternateRegion : primaryRegion;
        const otherRegion = repeatsPrimaryText ? primaryRegion : alternateRegion;

        // Leave the unused region empty, without stale language metadata
        otherRegion.textContent = "";
        otherRegion.removeAttribute("lang");

        // Set the language before inserting text. Omission restores inherited language
        if (lang === undefined) {
          receivingRegion.removeAttribute("lang");
        } else {
          receivingRegion.lang = lang;
        }
        receivingRegion.textContent = message;
      }
    };

    const clearLiveRegions = () => {
      for (const ref of [messageLowRef, messageHighRef, alternateLowRef, alternateHighRef]) {
        if (ref.current) {
          ref.current.textContent = "";
          ref.current.removeAttribute("lang");
        }
      }
    };

    return registerHost({ scope, publish: updateLiveRegion, clear: clearLiveRegions });
  }, [scope, active]);

  // Prime the live regions and add redundant aria-live attribute for best AT support
  // - aria-atomic requests the whole message rather than only the changed text
  // - explicit aria-live with implicit roles to add increased support/compatibility for some screen readers
  return (
    <div style={visuallyHiddenStyle}>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="gc-announce-polite"
        ref={messageLowRef}
      ></div>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-testid="gc-announce-polite-alternate"
        ref={alternateLowRef}
      ></div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-testid="gc-announce-assertive"
        ref={messageHighRef}
      ></div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        data-testid="gc-announce-assertive-alternate"
        ref={alternateHighRef}
      ></div>
    </div>
  );
};
