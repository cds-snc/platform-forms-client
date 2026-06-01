import { useCallback, useEffect, useRef } from "react";
import { FormsTemplateWithLockInfo, EditLocksResponse } from "../types";

interface UseEditLockPollingProps {
  templates: FormsTemplateWithLockInfo[];
  displayedCount: number;
  pollIntervalMs: number;
  onUpdate: (updater: (prev: FormsTemplateWithLockInfo[]) => FormsTemplateWithLockInfo[]) => void;
}

/**
 * Custom hook to handle edit lock polling with request deduplication
 */
export function useEditLockPolling({
  templates,
  displayedCount,
  pollIntervalMs,
  onUpdate,
}: UseEditLockPollingProps) {
  const templatesRef = useRef(templates);
  const displayedCountRef = useRef(displayedCount);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchInProgressRef = useRef(false);

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
    const templateIds = displayedTemplates.map((t) => t.id);

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

  // Poll for edit lock updates at regular intervals
  // Also pause/resume polling based on tab visibility
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const startPolling = () => {
      // Call immediately when starting
      void fetchEditLockUpdates();

      // Set up polling interval
      intervalId = setInterval(() => {
        void fetchEditLockUpdates();
      }, pollIntervalMs);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became inactive - pause polling
        stopPolling();
      } else {
        // Tab became active - resume polling
        stopPolling(); // Clear any existing interval first
        startPolling();
      }
    };

    // Start polling on mount
    startPolling();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Cancel any in-flight request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchEditLockUpdates, pollIntervalMs]);
}
