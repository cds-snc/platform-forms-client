"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormRecord } from "@lib/types";
import { clearTemplateStore } from "@lib/store/utils";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { useEditLockPresence } from "@lib/hooks/form-builder/useEditLockPresence";
import { useActiveTab } from "@lib/hooks/form-builder/useActiveTab";
import { isEditLockStatus, type EditLockStatusPayload } from "@lib/editLockStatus";
import {
  EDIT_LOCK_HEARTBEAT_INTERVAL_MS,
  EDIT_LOCK_STATUS_POLL_INTERVAL_MS,
} from "@lib/formBuilderEditLockPresence";
import { useEditLockInactiveUser } from "./useEditLockInactiveTimeout";

const SERVER_STATE_SYNC_MAX_ATTEMPTS = 10;
const SERVER_STATE_SYNC_RETRY_MS = 500;
type EditLockRequestType =
  | "acquire"
  | "heartbeat"
  | "lock-status-poll"
  | "release"
  | "takeover"
  | "takeover-save-complete"
  | "event-stream";

const wait = async (timeMs: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, timeMs);
  });

const buildEditLockUrl = (formId: string, requestType: EditLockRequestType) =>
  `/api/templates/${formId}/edit-lock?requestType=${requestType}`;

const buildEditLockEventsUrl = (formId: string) =>
  `/api/templates/${formId}/edit-lock/events?requestType=event-stream`;

export const useEditLock = ({
  formId,
  enabled,
  sessionId,
}: {
  formId: string;
  enabled: boolean;
  sessionId: string;
}) => {
  "use memo";
  const { status } = useSession();
  const setEditLock = useTemplateStore((s) => s.setEditLock);
  const setIsLockedByOther = useTemplateStore((s) => s.setIsLockedByOther);
  const setFromRecord = useTemplateStore((s) => s.setFromRecord);
  const { resetState, saveDraft, saveDraftIfNeeded, setUpdatedAt, updatedAt } =
    useTemplateContext();

  const isOwnerRef = useRef(false);
  const heartbeatRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const startPollingRef = useRef<() => void>(() => undefined);
  const lockLoopTokenRef = useRef(0);
  const updatedAtRef = useRef(updatedAt);
  const takeoverSaveRef = useRef<Promise<void> | null>(null);
  const suppressReleaseRef = useRef(false);

  const { getIsActiveTab } = useActiveTab({
    coordinationKey: formId,
  });

  // const cleanupHeartbeat = useCallback(() => {
  //   console.log("User identified as inactive due to inactivity timeout. This is where you'd trigger any additional handling needed for inactive users, such as showing a warning or releasing the lock.");
  //   if (heartbeatRef.current) {
  //     window.clearInterval(heartbeatRef.current);
  //     heartbeatRef.current = null;
  //   }
  //   clearEvents();
  // }, []);

  const clearLockState = useCallback(() => {
    setIsLockedByOther(false);
    setEditLock(null);
    isOwnerRef.current = false;
  }, [setEditLock, setIsLockedByOther]);

  const setTakeoverFallbackState = useCallback(() => {
    setIsLockedByOther(true);
    setEditLock(null);
    isOwnerRef.current = false;
  }, [setEditLock, setIsLockedByOther]);

  const clearTimers = useCallback(() => {
    lockLoopTokenRef.current += 1;
    if (heartbeatRef.current) {
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const clearEvents = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  const handleOwnerIdleTimeout = useCallback(() => {
    clearTimers();
    clearEvents();
  }, [clearEvents, clearTimers]);

  const { startOwnerIdleTimer, clearOwnerIdleTimer, isOwnerIdleTimeExpired } =
    useEditLockInactiveUser({
      onOwnerIdleTimeout: handleOwnerIdleTimeout,
    });

  const handleOwnerActivity = useCallback(() => {
    if (isOwnerRef.current) {
      startOwnerIdleTimer();
    }
  }, [startOwnerIdleTimer]);

  const { getActivitySnapshot } = useEditLockPresence({
    getIsActiveTab,
    onActivity: handleOwnerActivity,
  });

  const updateStore = useCallback(
    (status: EditLockStatusPayload) => {
      setIsLockedByOther(status.lockedByOther);
      setEditLock(
        status.lock
          ? {
              lockedByUserId: status.lock.lockedByUserId,
              lockedByName: status.lock.lockedByName ?? null,
              lockedByEmail: status.lock.lockedByEmail ?? null,
              lockedAt: status.lock.lockedAt,
              heartbeatAt: status.lock.heartbeatAt,
              expiresAt: status.lock.expiresAt,
              lastActivityAt: status.lock.lastActivityAt ?? null,
              visibilityState: status.lock.visibilityState ?? null,
              presenceStatus: status.lock.presenceStatus ?? null,
              isOwner: status.isOwner,
              lockedByOther: status.lockedByOther,
            }
          : null
      );
      isOwnerRef.current = status.isOwner;
      if (status.isOwner) {
        suppressReleaseRef.current = false;
        startOwnerIdleTimer();
      } else {
        clearOwnerIdleTimer();
      }
    },
    [setEditLock, setIsLockedByOther, startOwnerIdleTimer, clearOwnerIdleTimer]
  );

  const postAction = useCallback(
    async (action: "acquire" | "heartbeat" | "release" | "takeover" | "takeover-save-complete") => {
      const activity = getActivitySnapshot();

      const res = await fetch(buildEditLockUrl(formId, action), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          sessionId,
          ...(activity ? { activity } : {}),
        }),
      });

      const payload = (await res.json().catch(() => null)) as unknown;
      return isEditLockStatus(payload) ? payload : null;
    },
    [formId, getActivitySnapshot, sessionId]
  );

  // When this tab does not own the lock, it polls lock status until ownership changes.
  // This is the only recurring non-owner edit-lock request; other updates arrive via SSE.
  const getLockStatus = useCallback(async () => {
    const res = await fetch(buildEditLockUrl(formId, "lock-status-poll"), {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await res.json().catch(() => null)) as unknown;
    return isEditLockStatus(payload) ? payload : null;
  }, [formId]);

  const refreshForm = useCallback(
    async (minimumUpdatedAt?: number) => {
      const fetchLatestRecord = async (attempt: number): Promise<void> => {
        const res = await fetch(`/api/templates/${formId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          return;
        }

        const record = (await res.json()) as FormRecord;
        if (!record?.form) {
          return;
        }

        const recordUpdatedAt = record.updatedAt ? new Date(record.updatedAt).getTime() : undefined;
        const shouldRetry =
          minimumUpdatedAt !== undefined &&
          recordUpdatedAt !== undefined &&
          recordUpdatedAt <= minimumUpdatedAt &&
          attempt < SERVER_STATE_SYNC_MAX_ATTEMPTS - 1;

        if (shouldRetry) {
          await wait(SERVER_STATE_SYNC_RETRY_MS);
          await fetchLatestRecord(attempt + 1);
          return;
        }

        clearTemplateStore();
        setFromRecord(record);
        setUpdatedAt(recordUpdatedAt);
        resetState();
      };

      await fetchLatestRecord(0);
    },
    [formId, resetState, setFromRecord, setUpdatedAt]
  );

  useEffect(() => {
    updatedAtRef.current = updatedAt;
  }, [updatedAt]);

  const syncServerState = useCallback(async () => {
    await refreshForm(updatedAtRef.current);
  }, [refreshForm]);

  const flushDraftBeforeTakeover = useCallback(async () => {
    if (!isOwnerRef.current) {
      return;
    }

    suppressReleaseRef.current = true;

    if (!takeoverSaveRef.current) {
      takeoverSaveRef.current = (async () => {
        try {
          await saveDraft();
        } finally {
          try {
            await postAction("takeover-save-complete");
          } catch {
            // no-op: takeover will fall back to the server timeout if the ack cannot be sent
          }
        }
      })().finally(() => {
        takeoverSaveRef.current = null;
      });
    }

    await takeoverSaveRef.current;
  }, [postAction, saveDraft]);

  const autoSaveIfOwner = useCallback(
    async (wasOwner: boolean) => {
      if (!wasOwner) {
        return;
      }

      try {
        await saveDraftIfNeeded();
      } catch {
        // no-op: losing the lock should still fall back to state sync even if save fails
      }
    },
    [saveDraftIfNeeded]
  );

  // Owners keep the lock alive on this interval while they still hold it.
  const startHeartbeat = useCallback((): void => {
    clearTimers();
    const loopToken = lockLoopTokenRef.current;
    heartbeatRef.current = window.setInterval(async () => {
      const wasOwner = isOwnerRef.current;
      const heartbeatResult = await postAction("heartbeat");
      if (lockLoopTokenRef.current !== loopToken) {
        return;
      }

      if (!heartbeatResult) {
        clearTimers();
        clearLockState();
        return;
      }

      if (!heartbeatResult.isOwner) {
        await autoSaveIfOwner(wasOwner);
      }

      updateStore(heartbeatResult);

      if (heartbeatResult.locked && !heartbeatResult.isOwner && wasOwner) {
        startPollingRef.current();
        void syncServerState();
        return;
      }

      if (!heartbeatResult.locked) {
        clearTimers();
        setTakeoverFallbackState();
      }
    }, EDIT_LOCK_HEARTBEAT_INTERVAL_MS);
  }, [
    autoSaveIfOwner,
    clearLockState,
    clearTimers,
    postAction,
    setTakeoverFallbackState,
    syncServerState,
    updateStore,
  ]);

  // Non-owners poll on this interval while waiting for the lock state to change.
  // If active-tab coordination is enabled, only the active tab polls to reduce requests.
  const startPolling = useCallback((): void => {
    clearTimers();
    const loopToken = lockLoopTokenRef.current;
    pollRef.current = window.setInterval(async () => {
      const wasOwner = isOwnerRef.current;
      const pollResult = await getLockStatus();
      if (lockLoopTokenRef.current !== loopToken) {
        return;
      }

      if (!pollResult) {
        clearTimers();
        clearLockState();
        return;
      }

      updateStore(pollResult);
      if (pollResult.locked && !pollResult.isOwner && wasOwner) {
        void syncServerState();
      }
      if (!pollResult.locked) {
        clearTimers();
        setTakeoverFallbackState();
      }
    }, EDIT_LOCK_STATUS_POLL_INTERVAL_MS);
  }, [
    clearLockState,
    clearTimers,
    getLockStatus,
    setTakeoverFallbackState,
    syncServerState,
    updateStore,
  ]);

  const startTimers = useCallback(
    (statusResult: EditLockStatusPayload, cancelled = false) => {
      if (cancelled) return;
      if (statusResult.isOwner) {
        startHeartbeat();
      } else {
        // For non-owners with active-tab coordination, only start polling if this is the active tab
        if (getIsActiveTab()) {
          startPolling();
        }
      }
    },
    [startHeartbeat, startPolling, getIsActiveTab]
  );

  // When a non-owner tab's active status changes, update polling state accordingly.
  // Only the active tab should have the polling interval active to reduce network traffic.
  useEffect(() => {
    // Only applies to non-owners with active-tab coordination enabled
    if (isOwnerRef.current) {
      return;
    }

    if (getIsActiveTab()) {
      // Tab just became active - start polling if not already running
      if (!pollRef.current) {
        startPollingRef.current();
      } else {
        // Poll immediately to refresh state before next interval tick
        void getLockStatus().then((result) => {
          if (result) {
            cbRef.current.updateStore(result);
          }
        });
      }
    } else {
      // Tab stopped being active - stop polling
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  }, [getLockStatus, getIsActiveTab]);

  // The main effect runs whenever "enabled" or "status" changes to start/stop
  // the lock logic. The ref "container" is necessary to hold the latest
  // callbacks without re-running the effect and restarting timers on every
  // store update. Zustand updates were previous causing an infinite loop
  // from the below as useEffect dependencies.
  const callbacks = {
    postAction,
    updateStore,
    syncServerState,
    clearLockState,
    clearTimers,
    clearEvents,
    flushDraftBeforeTakeover,
    startTimers,
    setTakeoverFallbackState,
  };
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;
  startPollingRef.current = startPolling;

  useEffect(() => {
    if (!enabled || status !== "authenticated") {
      cbRef.current.clearTimers();
      cbRef.current.clearLockState();
      return;
    }

    let cancelled = false;

    const acquire = async () => {
      const statusResult = await cbRef.current.postAction("acquire");
      if (cancelled) return;

      if (!statusResult) {
        cbRef.current.clearLockState();
        return;
      }

      cbRef.current.updateStore(statusResult);
      cbRef.current.startTimers(statusResult, cancelled);
      if (!statusResult.isOwner) {
        void cbRef.current.syncServerState();
      }
    };

    acquire();

    return () => {
      cancelled = true;
      cbRef.current.clearTimers();
      if (isOwnerRef.current && !suppressReleaseRef.current) {
        cbRef.current.postAction("release");
      }
    };
  }, [enabled, status]);

  // Manage the shared SSE EventSource connection for edit-lock updates.
  // If an SSE event is missed, the next owner heartbeat or non-owner status poll
  // reconciles state from the server, and EventSource will retry on transient drops.
  useEffect(() => {
    if (!enabled || status !== "authenticated") {
      cbRef.current.clearEvents();
      return;
    }

    // Owners and non-owners both keep the SSE stream open so either side can react
    // immediately to lock changes without waiting for the next interval tick.
    const eventSource = new EventSource(buildEditLockEventsUrl(formId));
    eventSourceRef.current = eventSource;

    const handleLockStatus: EventListener = (event) => {
      const messageEvent = event as MessageEvent<string>;

      void (async () => {
        const nextStatus = JSON.parse(messageEvent.data) as EditLockStatusPayload;
        const wasOwner = isOwnerRef.current;

        if (!nextStatus.locked) {
          // Lock is free. Show the takeover overlay so the user can claim it
          // explicitly via the "Take over" button.
          if (!wasOwner) {
            cbRef.current.clearTimers();
            cbRef.current.setTakeoverFallbackState();
          }
          return;
        }

        cbRef.current.updateStore(nextStatus);

        if (!nextStatus.isOwner) {
          if (wasOwner) {
            // Shared SSE event, but this branch is specifically the previous owner
            // learning they lost the lock and switching into the non-owner path.
            startPollingRef.current();
            void cbRef.current.syncServerState();
          }
        }
      })();
    };

    const handleTakeoverRequested: EventListener = () => {
      // Shared SSE event. Only the current owner does any work here because
      // flushDraftBeforeTakeover() returns immediately for non-owners.
      void cbRef.current.flushDraftBeforeTakeover();
    };

    eventSource.addEventListener("lock-status", handleLockStatus);
    eventSource.addEventListener("takeover-requested", handleTakeoverRequested);
    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED && eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };

    return () => {
      eventSource.removeEventListener("lock-status", handleLockStatus);
      eventSource.removeEventListener("takeover-requested", handleTakeoverRequested);
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };
  }, [enabled, formId, status]);

  const takeover = useCallback(async () => {
    const previousUpdatedAt = updatedAt;
    const statusResult = (await postAction("takeover")) as EditLockStatusPayload & {
      error?: string;
    };
    if (statusResult?.error) {
      throw new Error(statusResult.error);
    }
    await refreshForm(previousUpdatedAt);
    updateStore(statusResult);
    startTimers(statusResult);
  }, [postAction, refreshForm, startTimers, updateStore, updatedAt]);

  return { takeover, getIsActiveTab, isOwnerIdleTimeExpired };
};
