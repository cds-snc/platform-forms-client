"use client";

import { useEffect, useRef } from "react";
import {
  CLIENT_SIDE_EDIT_LOCK_INACTIVE_TIMEOUT_MS,
  EDIT_LOCK_HEARTBEAT_INTERVAL_MS,
} from "@lib/formBuilderEditLockPresence";

/**
 * Keeps track of whether a user is identified as inactive and if so
 * fires a callback.
 *
 * @param enabled - When false the interval is not started.
 * @param getLastActivityAt - getter that returns the last-activity timestamp in MS.
 * @param onTimeout - Called once when user identified as inactive.
 */
export const useEditLockInactiveUser = ({
  enabled,
  getLastActivityAt,
  onTimeout,
}: {
  enabled: boolean;
  getLastActivityAt: () => number;
  onTimeout?: () => void;
}) => {
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = window.setInterval(() => {
      const lastActivityAt = getLastActivityAt();
      // Skip eviction until at least one activity event has happened - may not need this check
      if (lastActivityAt === 0) return;
      if (Date.now() - lastActivityAt >= CLIENT_SIDE_EDIT_LOCK_INACTIVE_TIMEOUT_MS) {
        onTimeoutRef.current?.();
      }
    }, EDIT_LOCK_HEARTBEAT_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [enabled, getLastActivityAt]);
};
