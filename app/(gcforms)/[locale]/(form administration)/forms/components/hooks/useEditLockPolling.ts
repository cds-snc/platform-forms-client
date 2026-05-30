import { useCallback, useEffect, useRef } from "react";
import { FormsTemplateWithLockInfo } from "../../page";
import { EditLocksResponse } from "../types";

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

      // Update templates with new lock info
      onUpdate((prevTemplates) =>
        prevTemplates.map((template) => {
          const lockInfo = data.editLocks[template.id];

          if (!lockInfo) {
            // No lock exists for this template
            return {
              ...template,
              hasEditLock: false,
              editLockInfo: null,
            };
          }

          // Lock exists, update it (whether new or existing)
          return {
            ...template,
            hasEditLock: true,
            editLockInfo: {
              lockedByUserId: lockInfo.lockedByUserId,
              lockedByName: lockInfo.lockedByName,
              lockedByEmail: null,
              lockedAt: new Date(lockInfo.lockedAt),
              heartbeatAt: new Date(lockInfo.heartbeatAt),
              expiresAt: new Date(lockInfo.expiresAt),
              lastActivityAt: lockInfo.lastActivityAt ? new Date(lockInfo.lastActivityAt) : null,
              visibilityState: lockInfo.visibilityState,
              presenceStatus: lockInfo.presenceStatus,
              sessionId: lockInfo.sessionId,
            },
          };
        })
      );
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
