"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormRecord } from "@lib/types";
import { clearTemplateStore } from "@lib/store/utils";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import {
  CLIENT_SIDE_EDIT_LOCK_ACTIVITY_THROTTLE_MS,
  CLIENT_SIDE_EDIT_LOCK_AWAY_MS,
  CLIENT_SIDE_EDIT_LOCK_IDLE_MS,
  EDIT_LOCK_DETECT_PRESENCE,
  EDIT_LOCK_HEARTBEAT_MS,
} from "@lib/formBuilderEditLockPresence";

const SERVER_STATE_SYNC_MAX_ATTEMPTS = 10;
const SERVER_STATE_SYNC_RETRY_MS = 500;

const wait = async (timeMs: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, timeMs);
  });

type EditLockPresenceStatus = "active" | "idle" | "away";
type EditLockVisibilityState = "visible" | "hidden";

type EditLockStatus = {
  locked: boolean;
  lockedByOther: boolean;
  isOwner: boolean;
  lock: {
    templateId: string;
    lockedByUserId: string;
    lockedByName?: string | null;
    lockedByEmail?: string | null;
    lockedAt: string;
    heartbeatAt: string;
    expiresAt: string;
    lastActivityAt?: string | null;
    visibilityState?: EditLockVisibilityState | null;
    presenceStatus?: EditLockPresenceStatus | null;
    sessionId?: string | null;
  } | null;
};

const isEditLockStatus = (value: unknown): value is EditLockStatus => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EditLockStatus>;
  return (
    typeof candidate.locked === "boolean" &&
    typeof candidate.lockedByOther === "boolean" &&
    typeof candidate.isOwner === "boolean" &&
    (candidate.lock === null || typeof candidate.lock === "object")
  );
};

export const useEditLock = ({
  formId,
  enabled,
  sessionId,
}: {
  formId: string;
  enabled: boolean;
  sessionId: string;
}) => {
  const { status } = useSession();
  const setEditLock = useTemplateStore((s) => s.setEditLock);
  const setIsLockedByOther = useTemplateStore((s) => s.setIsLockedByOther);
  const setFromRecord = useTemplateStore((s) => s.setFromRecord);
  const { resetState, saveDraft, setUpdatedAt, updatedAt } = useTemplateContext();

  const isOwnerRef = useRef(false);
  const heartbeatRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const startHeartbeatRef = useRef<() => void>(() => undefined);
  const startPollingRef = useRef<() => void>(() => undefined);
  const lockLoopTokenRef = useRef(0);
  const lastActivityAtRef = useRef(0);
  const takeoverSaveRef = useRef<Promise<void> | null>(null);
  const visibilityStateRef = useRef<EditLockVisibilityState>("visible");

  const clearLockState = useCallback(() => {
    setIsLockedByOther(false);
    setEditLock(null);
    isOwnerRef.current = false;
  }, [setEditLock, setIsLockedByOther]);

  const updateStore = useCallback(
    (status: EditLockStatus) => {
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
      const now = Date.now();
      const lastActivityAt = lastActivityAtRef.current || now;
      const idleMs = now - lastActivityAt;
      const visibilityState = visibilityStateRef.current;
      const presenceStatus: EditLockPresenceStatus =
        visibilityState === "hidden" || idleMs >= CLIENT_SIDE_EDIT_LOCK_AWAY_MS
          ? "away"
          : idleMs >= CLIENT_SIDE_EDIT_LOCK_IDLE_MS
            ? "idle"
            : "active";

      const res = await fetch(`/api/templates/${formId}/edit-lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          sessionId,
          activity: EDIT_LOCK_DETECT_PRESENCE
            ? {
                lastActivityAt: new Date(lastActivityAt).toISOString(),
                visibilityState,
                presenceStatus,
              }
            : undefined,
        }),
      });

      const payload = (await res.json().catch(() => null)) as unknown;
      return isEditLockStatus(payload) ? payload : null;
    },
    [formId, sessionId]
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

  const syncServerState = useCallback(async () => {
    await refreshForm(updatedAt);
  }, [refreshForm, updatedAt]);

  const flushDraftBeforeTakeover = useCallback(async () => {
    if (!isOwnerRef.current) {
      return;
    }

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

  const startHeartbeat = useCallback((): void => {
    clearTimers();
    const loopToken = lockLoopTokenRef.current;
    heartbeatRef.current = window.setInterval(async () => {
      const heartbeatResult = await postAction("heartbeat");
      if (lockLoopTokenRef.current !== loopToken) {
        return;
      }

      if (!heartbeatResult) {
        clearTimers();
        clearLockState();
        return;
      }

      updateStore(heartbeatResult);

      if (!heartbeatResult.locked) {
        const retryResult = await postAction("acquire");
        if (lockLoopTokenRef.current !== loopToken) {
          return;
        }

        if (!retryResult) {
          clearTimers();
          clearLockState();
          return;
        }

        updateStore(retryResult);
        if (retryResult.isOwner) {
          return;
        }

        startPollingRef.current();
      }
    }, EDIT_LOCK_HEARTBEAT_MS);
  }, [clearLockState, clearTimers, postAction, updateStore]);

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
        const retryResult = await postAction("acquire");
        if (lockLoopTokenRef.current !== loopToken) {
          return;
        }

        if (!retryResult) {
          clearTimers();
          clearLockState();
          return;
        }

        updateStore(retryResult);
        if (retryResult.isOwner) {
          startHeartbeatRef.current();
          void refreshForm();
        }
      }
    }, EDIT_LOCK_HEARTBEAT_MS);
  }, [
    clearLockState,
    clearTimers,
    getStatus,
    postAction,
    refreshForm,
    syncServerState,
    updateStore,
  ]);

  useEffect(() => {
    startHeartbeatRef.current = startHeartbeat;
  }, [startHeartbeat]);

  useEffect(() => {
    startPollingRef.current = startPolling;
  }, [startPolling]);

  const startTimers = useCallback(
    (statusResult: EditLockStatus, cancelled = false) => {
      if (cancelled) return;
      if (statusResult.isOwner) {
        startHeartbeat();
      } else {
        startPolling();
      }
    },
    [startHeartbeat, startPolling]
  );

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      clearEvents();
      clearLockState();
      return;
    }

    if (status !== "authenticated") {
      clearTimers();
      clearEvents();
      clearLockState();
      return;
    }

    let cancelled = false;

    const acquire = async () => {
      const statusResult = await postAction("acquire");
      if (cancelled) return;

      if (!statusResult) {
        clearLockState();
        return;
      }

      updateStore(statusResult);
      startTimers(statusResult, cancelled);
      if (!statusResult.isOwner) {
        void syncServerState();
      }
    };

    acquire();

    return () => {
      cancelled = true;
      clearTimers();
      clearEvents();
      if (isOwnerRef.current) {
        postAction("release");
      }
    };
  }, [
    enabled,
    formId,
    clearLockState,
    clearTimers,
    clearEvents,
    getStatus,
    postAction,
    refreshForm,
    sessionId,
    startTimers,
    status,
    syncServerState,
    updateStore,
  ]);

  useEffect(() => {
    if (!EDIT_LOCK_DETECT_PRESENCE || !enabled || status !== "authenticated") {
      return;
    }

    const markActivity = (force = false) => {
      const nextVisibilityState = document.visibilityState === "hidden" ? "hidden" : "visible";
      const now = Date.now();

      if (
        !force &&
        nextVisibilityState === visibilityStateRef.current &&
        now - lastActivityAtRef.current < CLIENT_SIDE_EDIT_LOCK_ACTIVITY_THROTTLE_MS
      ) {
        return;
      }

      lastActivityAtRef.current = now;
      visibilityStateRef.current = nextVisibilityState;
    };

    const handleVisibilityChange = () => {
      visibilityStateRef.current = document.visibilityState === "hidden" ? "hidden" : "visible";
      if (visibilityStateRef.current === "visible") {
        markActivity(true);
      }
    };

    const handleActivity = () => {
      markActivity();
    };

    markActivity(true);

    window.addEventListener("pointerdown", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("focus", handleActivity);
    window.addEventListener("input", handleActivity, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pointerdown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("focus", handleActivity);
      window.removeEventListener("input", handleActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, status]);

  useEffect(() => {
    if (!enabled || status !== "authenticated") {
      clearEvents();
      return;
    }

    const eventSource = new EventSource(`/api/templates/${formId}/edit-lock/events`);
    eventSourceRef.current = eventSource;

    const handleLockStatus: EventListener = (event) => {
      const messageEvent = event as MessageEvent<string>;

      void (async () => {
        const nextStatus = JSON.parse(messageEvent.data) as EditLockStatus;
        const wasOwner = isOwnerRef.current;

        if (!nextStatus.locked) {
          return;
        }

        updateStore(nextStatus);

        if (!nextStatus.isOwner) {
          if (wasOwner) {
            startPolling();
            void syncServerState();
          }
        }
      })();
    };

    const handleTakeoverRequested: EventListener = () => {
      void flushDraftBeforeTakeover();
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
  }, [
    clearEvents,
    enabled,
    flushDraftBeforeTakeover,
    formId,
    startPolling,
    status,
    syncServerState,
    updateStore,
  ]);

  const takeover = useCallback(async () => {
    const previousUpdatedAt = updatedAt;
    const statusResult = (await postAction("takeover")) as EditLockStatus & { error?: string };
    if (statusResult?.error) {
      throw new Error(statusResult.error);
    }
    await refreshForm(previousUpdatedAt);
    updateStore(statusResult);
    startTimers(statusResult);
  }, [postAction, refreshForm, startTimers, updateStore, updatedAt]);

  return { takeover };
};
