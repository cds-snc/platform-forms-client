"use client";

import { useEffect, useRef } from "react";
import { Priority } from "./AnnounceLiveRegions";
import { announce, type AnnounceOptions } from "./announce";

export interface UseAnnounceOptions extends Pick<AnnounceOptions, "allowDuplicates"> {
  active?: boolean;
  delay?: number;
  priority?: Priority;
  skipOnActivation?: boolean;
  resetKey?: unknown;
}

/**
 * Wraps announce() with debouncing and cancels pending requests when the input
 * changes or the component becomes inactive or unmounts.
 */
export function useAnnounce(
  message: string,
  {
    active = true,
    delay = 0,
    priority = Priority.LOW,
    skipOnActivation = false,
    allowDuplicates = false,
    resetKey,
  }: UseAnnounceOptions = {}
) {
  const wasActiveRef = useRef(false);

  // Reset before the request effect so skipOnActivation also works during
  // Strict Mode's development-only effect replay.
  useEffect(() => {
    wasActiveRef.current = false;
  }, [active]);

  useEffect(() => {
    const justActivated = active && !wasActiveRef.current;
    wasActiveRef.current = active;
    if (!active || !message || (skipOnActivation && justActivated)) return;

    if (!Number.isFinite(delay) || delay < 0) {
      // eslint-disable-next-line no-console
      console.error("[gcforms/announce] Announcement delay must be a non-negative finite number.");
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      announce(message, priority, { allowDuplicates, signal: controller.signal });
    }, delay);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [message, active, delay, priority, skipOnActivation, allowDuplicates, resetKey]);
}
