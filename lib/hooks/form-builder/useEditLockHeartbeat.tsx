"use client";

import { useCallback, useRef } from "react";
import { type EditLockStatusPayload } from "@lib/editLockStatus";
import { EDIT_LOCK_HEARTBEAT_INTERVAL_MS } from "@lib/formBuilderEditLockPresence";

export const useEditLockHeartbeat = ({
  lockLoopTokenRef,
  isOwnerRef,
  postAction,
  clearLockState,
  updateStore,
  setTakeoverFallbackState,
  saveDraftIfNeeded,
  onReleaseLock,
}: {
  lockLoopTokenRef: { current: number };
  isOwnerRef: { current: boolean };
  postAction: (action: "heartbeat") => Promise<EditLockStatusPayload | null>;
  clearLockState: () => void;
  updateStore: (status: EditLockStatusPayload) => void;
  setTakeoverFallbackState: () => void;
  saveDraftIfNeeded: () => Promise<unknown>;
  onReleaseLock: () => void;
}) => {
  "use memo";

  const heartbeatRef = useRef<number | null>(null);

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

  const stopHeartbeat = useCallback((): void => {
    if (!heartbeatRef.current) {
      return;
    }

    lockLoopTokenRef.current += 1; // TODO: is this still needed?
    window.clearInterval(heartbeatRef.current);
    heartbeatRef.current = null;
  }, [heartbeatRef, lockLoopTokenRef]);

  // Owners keep the lock alive on this interval while they still hold it.
  const startHeartbeat = useCallback((): void => {
    // clearTimers();
    stopHeartbeat();
    const loopToken = lockLoopTokenRef.current;
    heartbeatRef.current = window.setInterval(async () => {
      const wasOwner = isOwnerRef.current;
      const heartbeatResult = await postAction("heartbeat");
      // TODO: is this still needed?
      if (lockLoopTokenRef.current !== loopToken) {
        return;
      }

      if (!heartbeatResult) {
        // clearTimers();
        stopHeartbeat();
        clearLockState();
        return;
      }

      if (!heartbeatResult.isOwner) {
        await autoSaveIfOwner(wasOwner);
      }

      updateStore(heartbeatResult);

      if (heartbeatResult.locked && !heartbeatResult.isOwner && wasOwner) {
        // startPollingRef.current();
        // void syncServerState();
        onReleaseLock();
        return;
      }

      if (!heartbeatResult.locked) {
        // clearTimers();
        stopHeartbeat();
        setTakeoverFallbackState();
      }
    }, EDIT_LOCK_HEARTBEAT_INTERVAL_MS);
  }, [
    autoSaveIfOwner,
    clearLockState,
    isOwnerRef,
    lockLoopTokenRef,
    postAction,
    setTakeoverFallbackState,
    stopHeartbeat,
    updateStore,
    onReleaseLock,
  ]);

  return { startHeartbeat, stopHeartbeat };
};
