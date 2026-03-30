import { useEffect, useRef, useState } from "react";

interface UseAllowDuplicateAnnouncerOptions {
  message: string;
  // Whether to use the shorter delay for onscreen keyboard workarounds
  delayCondition: boolean;
  // Pass the active/open state so the hook can suppress the announcement
  // on the initial activation — AT already announces that state change natively
  // (e.g. via aria-expanded).
  isActive: boolean;
}

interface UseAllowDuplicateAnnouncerResult {
  // Toggle value — alternates on each announcement to force a DOM mutation
  bump: boolean;
  announcedMessage: string;
}

/**
 * Drives two alternating aria-live regions so that AT announce every update
 * even when the message text hasn't changed (screen readers normally ignore
 * duplicate live-region content). Inspired by the GOV.UK "bump" announcer pattern.
 */
export function useAllowDuplicateAnnouncer({
  message,
  delayCondition,
  isActive,
}: UseAllowDuplicateAnnouncerOptions): UseAllowDuplicateAnnouncerResult {
  const [bump, setBump] = useState(false);
  const [announcedMessage, setAnnouncedMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevIsOpenRef = useRef(false);

  // Add some workarounds for onscreen keyboards: 400ms for no-results (query obviously done),
  // 1400ms otherwise to avoid mid-keystroke noise when typing quickly. These are based on
  // testing with iOS Safari+VoiceOver and may need adjustment for other AT/browser combos.
  const announcementDelay = delayCondition ? 400 : 1400;

  useEffect(() => {
    // Skip the announcement on initial activation
    const justActivated = isActive && !prevIsOpenRef.current;
    prevIsOpenRef.current = isActive;

    if (justActivated) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setAnnouncedMessage(message);
      setBump((b) => !b);
    }, announcementDelay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [message, isActive, announcementDelay]);

  return { bump, announcedMessage };
}

interface AllowDuplicateAnnouncerProps {
  // Unique id prefix — renders as `{id}-live-a` and `{id}-live-b`.
  id: string;
  bump: boolean;
  announcedMessage: string;
}

/**
 * Allow a duplicate message live region update to be announced by AT.
 * Live regions by default ignore a duplicate message update. This function
 * renders the two alternating aria-live regions to "trick" AT into announcing
 * every message, including duplicates.
 *
 * Pair with `useAllowDuplicateAnnouncer` to drive the props.
 *
 * Usage:
 *   const { bump, announcedMessage } = useAllowDuplicateAnnouncer({ ... });
 *   <AllowDuplicateAnnouncer id={id} bump={bump} announcedMessage={announcedMessage} />
 */
export function AllowDuplicateAnnouncer({
  id,
  bump,
  announcedMessage,
}: AllowDuplicateAnnouncerProps) {
  return (
    <>
      <div id={`${id}-live-a`} aria-live="polite" aria-atomic="true" className="sr-only">
        {bump ? announcedMessage : ""}
      </div>
      <div id={`${id}-live-b`} aria-live="polite" aria-atomic="true" className="sr-only">
        {bump ? "" : announcedMessage}
      </div>
    </>
  );
}
