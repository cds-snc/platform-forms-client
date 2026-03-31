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

const SERVER_STATE_SYNC_MAX_ATTEMPTS = 5;
const SERVER_STATE_SYNC_RETRY_MS = 250;

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
  const setChangeKey = useTemplateStore((s) => s.setChangeKey);
  const setFromRecord = useTemplateStore((s) => s.setFromRecord);
  const { resetState, saveDraft, setUpdatedAt, updatedAt } = useTemplateContext();

  const isOwnerRef = useRef(false);
  const heartbeatRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lockLoopTokenRef = useRef(0);
  const lastActivityAtRef = useRef(0);
  const takeoverSaveRef = useRef<Promise<void> | null>(null);
  const visibilityStateRef = useRef<EditLockVisibilityState>("visible");

  const updateStore = useCallback(
    (status: EditLockStatus) => {
      setIsLockedByOther(!status.isOwner);
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
              lockedByOther: !status.isOwner,
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
    async (action: "acquire" | "heartbeat" | "release" | "takeover") => {
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
      return res.json();
    },
    [formId, sessionId]
  );

  const getStatus = useCallback(async () => {
    const res = await fetch(`/api/templates/${formId}/edit-lock`, {
      method: "GET",
      cache: "no-store",
    });
    return res.json();
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
        setChangeKey(String(Date.now()));
        setUpdatedAt(recordUpdatedAt);
        resetState();
      };

      await fetchLatestRecord(0);
    },
    [formId, resetState, setChangeKey, setFromRecord, setUpdatedAt]
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
        await saveDraft();
      })().finally(() => {
        takeoverSaveRef.current = null;
      });
    }

    await takeoverSaveRef.current;
  }, [saveDraft]);

  const startHeartbeat = useCallback(() => {
    clearTimers();
    const loopToken = lockLoopTokenRef.current;
    heartbeatRef.current = window.setInterval(async () => {
      const heartbeatResult = (await postAction("heartbeat")) as EditLockStatus;
      if (lockLoopTokenRef.current !== loopToken) {
        return;
      }
      updateStore(heartbeatResult);
    }, EDIT_LOCK_HEARTBEAT_MS);
  }, [clearTimers, postAction, updateStore]);

  const startPolling = useCallback(() => {
    clearTimers();
    const loopToken = lockLoopTokenRef.current;
    pollRef.current = window.setInterval(async () => {
      const wasOwner = isOwnerRef.current;
      const pollResult = (await getStatus()) as EditLockStatus;
      if (lockLoopTokenRef.current !== loopToken) {
        return;
      }
      updateStore(pollResult);
      if (pollResult.locked && !pollResult.isOwner && wasOwner) {
        void syncServerState();
      }
      if (!pollResult.locked) {
        const retryResult = (await postAction("acquire")) as EditLockStatus;
        if (lockLoopTokenRef.current !== loopToken) {
          return;
        }
        updateStore(retryResult);
        if (retryResult.isOwner) {
          startHeartbeat();
          void refreshForm();
        }
      }
    }, EDIT_LOCK_HEARTBEAT_MS);
  }, [
    clearTimers,
    getStatus,
    postAction,
    refreshForm,
    startHeartbeat,
    syncServerState,
    updateStore,
  ]);

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
      setIsLockedByOther(false);
      setEditLock(null);
      return;
    }

    if (status !== "authenticated") return;

    let cancelled = false;

    const acquire = async () => {
      const statusResult = (await postAction("acquire")) as EditLockStatus;
      if (cancelled) return;
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
    clearTimers,
    clearEvents,
    getStatus,
    postAction,
    refreshForm,
    sessionId,
    setEditLock,
    setIsLockedByOther,
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
