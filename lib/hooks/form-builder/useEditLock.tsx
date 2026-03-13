"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormRecord } from "@lib/types";
import { clearTemplateStore } from "@lib/store/utils";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";

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
    sessionId?: string | null;
  } | null;
};

const EDIT_LOCK_HEARTBEAT_MS = 15_000;
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
  const { resetState, setUpdatedAt } = useTemplateContext();

  const isOwnerRef = useRef(false);
  const heartbeatRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const lockLoopTokenRef = useRef(0);

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
      const res = await fetch(`/api/templates/${formId}/edit-lock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sessionId }),
      });
      return res.json();
    },
    [formId, sessionId]
  );

  const getStatus = useCallback(async () => {
    const res = await fetch(`/api/templates/${formId}/edit-lock`, { method: "GET" });
    return res.json();
  }, [formId]);

  const refreshForm = useCallback(async () => {
    const res = await fetch(`/api/templates/${formId}`, { method: "GET" });
    if (!res.ok) return;
    const record = (await res.json()) as FormRecord;
    if (record?.form) {
      clearTemplateStore();
      setFromRecord(record);
      setUpdatedAt(record.updatedAt ? new Date(record.updatedAt).getTime() : undefined);
      resetState();
    }
  }, [formId, resetState, setFromRecord, setUpdatedAt]);

  const syncServerState = useCallback(async () => {
    clearTemplateStore();
    await refreshForm();
  }, [refreshForm]);

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
        await syncServerState();
        if (lockLoopTokenRef.current !== loopToken) {
          return;
        }
      }
      if (!pollResult.locked) {
        const retryResult = (await postAction("acquire")) as EditLockStatus;
        if (lockLoopTokenRef.current !== loopToken) {
          return;
        }
        updateStore(retryResult);
        if (retryResult.isOwner) {
          await refreshForm();
          if (lockLoopTokenRef.current !== loopToken) {
            return;
          }
          startHeartbeat();
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
      if (!statusResult.isOwner) {
        await syncServerState();
      }
      startTimers(statusResult, cancelled);
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
            await syncServerState();
          }
          if (wasOwner) {
            startPolling();
          }
        }
      })();
    };

    eventSource.addEventListener("lock-status", handleLockStatus);
    eventSource.onerror = () => {
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };

    return () => {
      eventSource.removeEventListener("lock-status", handleLockStatus);
      eventSource.close();
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null;
      }
    };
  }, [clearEvents, enabled, formId, startPolling, status, syncServerState, updateStore]);

  const takeover = useCallback(async () => {
    const statusResult = (await postAction("takeover")) as EditLockStatus & { error?: string };
    if (statusResult?.error) {
      throw new Error(statusResult.error);
    }
    updateStore(statusResult);
    await refreshForm();
    startTimers(statusResult);
  }, [postAction, refreshForm, startTimers, updateStore]);

  return { takeover };
};
