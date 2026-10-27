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

  useEffect(() => {
    if (!active) return;

    const updateLiveRegion = (message: string, priority: Priority) => {
      const region = priority === Priority.HIGH ? messageHighRef.current : messageLowRef.current;
      if (region && region.textContent !== message) {
        region.textContent = message;
      }
    };

    const clearLiveRegions = () => {
      if (messageLowRef.current) messageLowRef.current.textContent = "";
      if (messageHighRef.current) messageHighRef.current.textContent = "";
    };

    return registerHost({ scope, publish: updateLiveRegion, clear: clearLiveRegions });
  }, [scope, active]);

  // Prime the live regions and add redundant aria-live attribute for best AT support
  return (
    <div style={visuallyHiddenStyle} data-announce-host={scope}>
      <div
        role="status"
        aria-live="polite"
        data-testid="gc-announce-polite"
        ref={messageLowRef}
      ></div>
      <div
        role="alert"
        aria-live="assertive"
        data-testid="gc-announce-assertive"
        ref={messageHighRef}
      ></div>
    </div>
  );
};
