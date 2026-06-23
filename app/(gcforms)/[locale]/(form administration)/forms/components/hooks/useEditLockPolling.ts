import { useCallback, useEffect, useRef } from "react";
import { FormsTemplateWithLockInfo, EditLocksResponse } from "../types";
import { logMessage } from "@root/lib/logger";
import { POLLING_TEMPLATE_CAP } from "../constants";

const PROGRESSIVE_BACKOFF = {
  step1: {
    threshold: 5 * 60 * 1000, // 5 minutes of inactivity
    pollIntervalMs: 10 * 1000, // 10 seconds
  },
  step2: {
    threshold: 10 * 60 * 1000, // 10 minutes of inactivity
    pollIntervalMs: 60 * 1000, // 1 minute
  },
  step3: {
    threshold: 20 * 60 * 1000, // 20 minutes of inactivity
    pollIntervalMs: 300 * 1000, // 5 minutes
  },
};

/**
 * Custom hook to handle edit lock polling with request deduplication
 */
export function useEditLockPolling({
  templates,
  displayedCount,
  pollIntervalMs,
  onUpdate,
  enabled = true,
}: {
  templates: FormsTemplateWithLockInfo[];
  displayedCount: number;
  pollIntervalMs: number;
  onUpdate: (updater: (prev: FormsTemplateWithLockInfo[]) => FormsTemplateWithLockInfo[]) => void;
  enabled?: boolean;
}) {
  const templatesRef = useRef(templates);
  const displayedCountRef = useRef(displayedCount);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchInProgressRef = useRef(false);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityAtRef = useRef<number>(Date.now());

  // Keep refs in sync with state
  useEffect(() => {
    templatesRef.current = templates;
  }, [templates]);

  useEffect(() => {
    displayedCountRef.current = displayedCount;
  }, [displayedCount]);

  const fetchEditLockUpdates = useCallback(async () => {
    // Skip if a fetch is already in progress (polling cadence > request time in normal conditions)
    if (fetchInProgressRef.current) {
      return;
    }

    // Poll only for displayed templates to reduce API payload
    const displayedTemplates = templatesRef.current.slice(0, displayedCountRef.current);
    const templateIds = displayedTemplates.map((t) => t.id).slice(0, POLLING_TEMPLATE_CAP);

    if (templateIds.length === 0) {
      return;
    }

    abortControllerRef.current = new AbortController();
    fetchInProgressRef.current = true;

    try {
      const response = await fetch("/api/forms/edit-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateIds }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // Handle permission errors by filtering out "invalid" templates we don't have access to.
        // This seems to happen mainly with some Archived forms. This seems strange because the initial
        // templates were pulled on page load without error. Regardless this helps handle invalid
        // template cases where one invalid template will cause the remaining to fail.
        if (response.status === 403) {
          // Remove all templates from the failed batch to stop infinite 403 loop
          // Note: The authorization check is all-or-nothing, so if ANY template is
          // inaccessible, the entire batch fails. We remove all to be safe.
          onUpdate((prevTemplates) => {
            const failedTemplateIds = new Set(templateIds);
            const filtered = prevTemplates.filter((t) => !failedTemplateIds.has(t.id));

            if (filtered.length !== prevTemplates.length) {
              logMessage.info(
                `[useEditLockPolling] Removed ${prevTemplates.length - filtered.length} templates after 403 error. IDs: ${templateIds.join(", ")}`
              );
            }

            return filtered;
          });
        }
        return;
      }

      const data: EditLocksResponse = await response.json();

      // Update templates with new lock info, preserving referential equality where
      // nothing changed so memoized child Cards skip re-rendering on each poll.
      onUpdate((prevTemplates) => {
        let changed = false;
        const next = prevTemplates.map((template) => {
          const incoming = data.editLocks[template.id];
          const previous = template.editLockInfo ?? null;

          if (!incoming) {
            if (!template.hasEditLock && previous === null) {
              return template;
            }
            changed = true;
            return { ...template, hasEditLock: false, editLockInfo: null };
          }

          const incomingLockedAt = new Date(incoming.lockedAt).getTime();
          const incomingHeartbeatAt = new Date(incoming.heartbeatAt).getTime();
          const incomingExpiresAt = new Date(incoming.expiresAt).getTime();
          const incomingLastActivityAt = incoming.lastActivityAt
            ? new Date(incoming.lastActivityAt).getTime()
            : null;

          // No change - do nothing (return unchanged template)
          if (
            previous &&
            template.hasEditLock &&
            previous.lockedByUserId === incoming.lockedByUserId &&
            previous.lockedByName === incoming.lockedByName &&
            previous.visibilityState === incoming.visibilityState &&
            previous.presenceStatus === incoming.presenceStatus &&
            previous.sessionId === incoming.sessionId &&
            previous.lockedAt.getTime() === incomingLockedAt &&
            previous.heartbeatAt.getTime() === incomingHeartbeatAt &&
            previous.expiresAt.getTime() === incomingExpiresAt &&
            (previous.lastActivityAt?.getTime() ?? null) === incomingLastActivityAt
          ) {
            return template;
          }

          // Changed - update template with new lock info so it can be re-rendered
          changed = true;
          return {
            ...template,
            hasEditLock: true,
            editLockInfo: {
              lockedByUserId: incoming.lockedByUserId,
              lockedByName: incoming.lockedByName,
              lockedAt: new Date(incomingLockedAt),
              heartbeatAt: new Date(incomingHeartbeatAt),
              expiresAt: new Date(incomingExpiresAt),
              lastActivityAt:
                incomingLastActivityAt !== null ? new Date(incomingLastActivityAt) : null,
              visibilityState: incoming.visibilityState,
              presenceStatus: incoming.presenceStatus,
              sessionId: incoming.sessionId,
            },
          };
        });

        return changed ? next : prevTemplates;
      });
    } catch (error) {
      // Ignore AbortError - it's expected when cancelling requests
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      // Silently fail other errors - try again on next poll
    } finally {
      fetchInProgressRef.current = false;
    }
  }, [onUpdate]);

  const getDynamicPollIntervalMs = useCallback(() => {
    const idleMs = Date.now() - lastActivityAtRef.current;

    if (idleMs >= PROGRESSIVE_BACKOFF.step3.threshold) {
      return PROGRESSIVE_BACKOFF.step3.pollIntervalMs;
    }

    if (idleMs >= PROGRESSIVE_BACKOFF.step2.threshold) {
      return PROGRESSIVE_BACKOFF.step2.pollIntervalMs;
    }

    if (idleMs >= PROGRESSIVE_BACKOFF.step1.threshold) {
      return PROGRESSIVE_BACKOFF.step1.pollIntervalMs;
    }

    return pollIntervalMs;
  }, [pollIntervalMs]);

  const clearScheduledPoll = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const scheduleNextPoll = useCallback(() => {
    clearScheduledPoll();

    if (document.hidden) {
      return;
    }

    timeoutIdRef.current = setTimeout(() => {
      void fetchEditLockUpdates();
      scheduleNextPoll();
    }, getDynamicPollIntervalMs());
  }, [clearScheduledPoll, fetchEditLockUpdates, getDynamicPollIntervalMs]);

  const markActivity = useCallback(() => {
    lastActivityAtRef.current = Date.now();
    scheduleNextPoll();
  }, [scheduleNextPoll]);

  // Poll for edit lock updates with progressive backoff based on inactivity.
  // Also pause/resume polling based on tab visibility.
  useEffect(() => {
    const startPolling = () => {
      if (document.hidden || !enabled) {
        return;
      }

      // Call immediately when starting.
      void fetchEditLockUpdates();
      scheduleNextPoll();
    };

    const stopPolling = () => {
      clearScheduledPoll();
    };

    const handleVisibilityChange = () => {
      if (document.hidden || !enabled) {
        // Tab became inactive - pause polling.
        stopPolling();
      } else {
        // Tab became active - treat as activity and restart immediately.
        markActivity();
        startPolling();
      }
    };

    const handleActivity = () => {
      markActivity();
    };

    // Start polling on mount if enabled
    if (enabled) {
      startPolling();
    }

    // Presence detection for progressive backoff
    document.addEventListener("visibilitychange", handleVisibilityChange); // TODO probably not needed since we won't be polling when hidden, could leave just in case
    window.addEventListener("pointerdown", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("focus", handleActivity);
    window.addEventListener("input", handleActivity, { passive: true });

    return () => {
      stopPolling();
      // Clean up progressive backoff listeners
      document.removeEventListener("visibilitychange", handleVisibilityChange); // TODO probably not needed since we won't be polling when hidden, could leave just in case
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("focus", handleActivity);
      window.removeEventListener("input", handleActivity);
      // Cancel any in-flight request on unmount.
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [clearScheduledPoll, fetchEditLockUpdates, markActivity, scheduleNextPoll, enabled]);
}
