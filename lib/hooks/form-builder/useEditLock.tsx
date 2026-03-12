"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTemplateStore } from "@lib/store/useTemplateStore";

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

  const isOwnerRef = useRef(false);
  const heartbeatRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

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
    if (heartbeatRef.current) {
      window.clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
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

  const startHeartbeat = useCallback(() => {
    clearTimers();
    heartbeatRef.current = window.setInterval(async () => {
      const heartbeatResult = (await postAction("heartbeat")) as EditLockStatus;
      updateStore(heartbeatResult);
    }, EDIT_LOCK_HEARTBEAT_MS);
  }, [clearTimers, postAction, updateStore]);

  const startPolling = useCallback(() => {
    clearTimers();
    pollRef.current = window.setInterval(async () => {
      const pollResult = (await getStatus()) as EditLockStatus;
      updateStore(pollResult);
      if (!pollResult.locked) {
        const retryResult = (await postAction("acquire")) as EditLockStatus;
        updateStore(retryResult);
        if (retryResult.isOwner) {
          startHeartbeat();
        }
      }
    }, EDIT_LOCK_HEARTBEAT_MS);
  }, [clearTimers, getStatus, postAction, startHeartbeat, updateStore]);

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
    };

    acquire();

    return () => {
      cancelled = true;
      clearTimers();
      if (isOwnerRef.current) {
        postAction("release");
      }
    };
  }, [
    enabled,
    formId,
    clearTimers,
    getStatus,
    postAction,
    sessionId,
    setEditLock,
    setIsLockedByOther,
    startTimers,
    status,
    updateStore,
  ]);

  const takeover = useCallback(async () => {
    const statusResult = (await postAction("takeover")) as EditLockStatus & { error?: string };
    if (statusResult?.error) {
      throw new Error(statusResult.error);
    }
    updateStore(statusResult);
    startTimers(statusResult);
  }, [postAction, startTimers, updateStore]);

  return { takeover };
};
