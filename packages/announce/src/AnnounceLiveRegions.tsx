"use client";

import { useEffect, useRef, type CSSProperties } from "react";
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
 * import { Announce } from "@gcforms/announce";
 * ...
 * <Announce />
 *
 * Then in any component you can use:
 * import { announce } from "@gcforms/announce";
 * ...
 * announce("Your message here");
 */
export const Announce = ({
  scope = "root",
  active = true,
}: {
  scope?: "root" | "modal";
  active?: boolean;
}) => {
  const messageLowRef = useRef<HTMLDivElement>(null);
  const messageHighRef = useRef<HTMLDivElement>(null);
  const alternateLowRef = useRef<HTMLDivElement>(null);
  const alternateHighRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const updateLiveRegion = (message: string, priority: Priority) => {
      const region = priority === Priority.HIGH ? messageHighRef.current : messageLowRef.current;
      const alternate =
        priority === Priority.HIGH ? alternateHighRef.current : alternateLowRef.current;
      if (region && alternate) {
        // Move repeated text to an already-mounted empty region to create a fresh update.
        if (region.textContent === message) {
          region.textContent = "";
          alternate.textContent = message;
        } else {
          alternate.textContent = "";
          region.textContent = message;
        }
      }
    };

    const clearLiveRegions = () => {
      for (const ref of [messageLowRef, messageHighRef, alternateLowRef, alternateHighRef]) {
        if (ref.current) ref.current.textContent = "";
      }
    };

    return registerHost({ scope, publish: updateLiveRegion, clear: clearLiveRegions });
  }, [scope, active]);

  // Prime the live regions and add redundant aria-live attribute for best AT support
  return (
    <div style={visuallyHiddenStyle} data-announce-host={scope}>
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
