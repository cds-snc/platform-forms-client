"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormRecord } from "@lib/types";
import { clearTemplateStore } from "@lib/store/utils";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { useEditLockPresence } from "@lib/hooks/form-builder/useEditLockPresence";
import { isEditLockStatus, type EditLockStatusPayload } from "@lib/editLockStatus";
import {
  EDIT_LOCK_DETECT_PRESENCE,
  EDIT_LOCK_HEARTBEAT_MS,
} from "@lib/formBuilderEditLockPresence";

const SERVER_STATE_SYNC_MAX_ATTEMPTS = 10;
const SERVER_STATE_SYNC_RETRY_MS = 500;

const wait = async (timeMs: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, timeMs);
  });

export const useEditLock = ({
  formId,
  enabled,
  presenceEnabled,
  sessionId,
}: {
  formId: string;
  enabled: boolean;
  presenceEnabled: boolean;
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
  const { getActivitySnapshot } = useEditLockPresence({
    enabled: presenceEnabled && EDIT_LOCK_DETECT_PRESENCE && enabled && status === "authenticated",
    coordinationKey: formId,
  });

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
      }
    },
    [setEditLock, setIsLockedByOther]
  );

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

  const postAction = useCallback(
    async (action: "acquire" | "heartbeat" | "release" | "takeover" | "takeover-save-complete") => {
      const activity = getActivitySnapshot();

      const res = await fetch(`/api/templates/${formId}/edit-lock`, {
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

  const getStatus = useCallback(async () => {
    const res = await fetch(`/api/templates/${formId}/edit-lock`, {
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
    }, EDIT_LOCK_HEARTBEAT_MS);
  }, [
    autoSaveIfOwner,
    clearLockState,
    clearTimers,
    postAction,
    setTakeoverFallbackState,
    syncServerState,
    updateStore,
  ]);

  const startPolling = useCallback((): void => {
    clearTimers();
    const loopToken = lockLoopTokenRef.current;
    pollRef.current = window.setInterval(async () => {
      const wasOwner = isOwnerRef.current;
      const pollResult = await getStatus();
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
    }, EDIT_LOCK_HEARTBEAT_MS);
  }, [
    clearLockState,
    clearTimers,
    getStatus,
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
        startPolling();
      }
    },
    [startHeartbeat, startPolling]
  );

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

  useEffect(() => {
    if (!enabled || status !== "authenticated") {
      cbRef.current.clearEvents();
      return;
    }

    const eventSource = new EventSource(`/api/templates/${formId}/edit-lock/events`);
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
            startPollingRef.current();
            void cbRef.current.syncServerState();
          }
        }
      })();
    };

    const handleTakeoverRequested: EventListener = () => {
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

  return { takeover };
};
