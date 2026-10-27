"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { createScheduler } from "./scheduler";

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

interface Message {
  message: string;
  priority?: Priority;
}

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
export const Announce = () => {
  const messageLowRef = useRef<HTMLDivElement>(null);
  const messageHighRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLiveRegion = (message: string, priority: Priority) => {
      const region = priority === Priority.HIGH ? messageHighRef.current : messageLowRef.current;
      if (region && region.textContent !== message) {
        region.textContent = message;
      }
    };

    const scheduler = createScheduler(updateLiveRegion);

    const handleAnnouncePolite = (event: Event) => {
      const customEvent = event as CustomEvent<Message>;
      scheduler.enqueue(customEvent.detail.message, Priority.LOW);
    };
    window.addEventListener("gc-announce-polite", handleAnnouncePolite);

    const handleAnnounceAssertive = (event: Event) => {
      const customEvent = event as CustomEvent<Message>;
      scheduler.enqueue(customEvent.detail.message, Priority.HIGH);
    };
    window.addEventListener("gc-announce-assertive", handleAnnounceAssertive);

    return () => {
      window.removeEventListener("gc-announce-polite", handleAnnouncePolite);
      window.removeEventListener("gc-announce-assertive", handleAnnounceAssertive);
      scheduler.stop();
    };
  }, []);

  // Prime the live regions and add redundant aria-live attribute for best AT support
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        style={visuallyHiddenStyle}
        data-testid="gc-announce-polite"
        ref={messageLowRef}
      ></div>
      <div
        role="alert"
        aria-live="assertive"
        style={visuallyHiddenStyle}
        data-testid="gc-announce-assertive"
        ref={messageHighRef}
      ></div>
    </>
  );
};
