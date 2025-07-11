import { useCallback, useEffect, useRef } from "react";
import "./Announce.css";

export enum Priority {
  LOW = "polite",
  HIGH = "assertive",
}

interface Message {
  message: string;
  priority?: Priority;
}

/**
 * Example usage:
 * In a top level component near the layout add:
 * import { Announce } from "@root/packages/announce/src/Announce";
 * ...
 * useAnnounce();
 *
 * Then in any component you can use:
 * import { announce } from "@root/packages/announce/utils/announce";
 * ...
 * announce("Your message here");
 */
export const Announce = () => {
  // Use refs to avoid unnecessary rerenders of this component
  const messageLowRef = useRef<HTMLDivElement>(null);
  const messageHighRef = useRef<HTMLDivElement>(null);

  const announcePolite = useCallback((message: string) => {
    if (!messageLowRef.current || messageLowRef.current.textContent === message) {
      return;
    }
    messageLowRef.current.textContent = message;
  }, []);

  const announceAssertive = useCallback((message: string) => {
    if (!messageHighRef.current || messageHighRef.current.textContent === message) {
      return;
    }
    messageHighRef.current.textContent = message;
  }, []);

  useEffect(() => {
    const handleAnnouncePolite = (event: Event) => {
      const customEvent = event as CustomEvent<Message>;
      announcePolite(customEvent.detail.message);
    };
    window.addEventListener("gc-announce-polite", handleAnnouncePolite);

    const handleAnnounceAssertive = (event: Event) => {
      const customEvent = event as CustomEvent<Message>;
      announceAssertive(customEvent.detail.message);
    };
    window.addEventListener("gc-announce-assertive", handleAnnounceAssertive);

    return () => {
      window.removeEventListener("gc-announce-polite", handleAnnouncePolite);
      window.removeEventListener("gc-announce-assertive", handleAnnounceAssertive);
    };
  }, [announcePolite, announceAssertive]);

  // Prime the live regions and add redundant aria-live attribute for best AT support
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className="gc-announce-sr-only"
        data-testid="gc-announce-polite"
        ref={messageLowRef}
      ></div>
      <div
        role="alert"
        aria-live="assertive"
        className="gc-announce-sr-only"
        data-testid="gc-announce-assertive"
        ref={messageHighRef}
      ></div>
    </>
  );
};
