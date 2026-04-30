"use client";

import { useRef, useState } from "react";
import {
  CLIENT_SIDE_EDIT_LOCK_INACTIVE_TIMEOUT_MS, // TODO update to use app setting
} from "@lib/formBuilderEditLockPresence";

const OWNER_IDLE_TIMER_RESET_THROTTLE_MS = Math.min(
  CLIENT_SIDE_EDIT_LOCK_INACTIVE_TIMEOUT_MS / 2,
  5_000
);

/**
 * Keeps track of whether a user is identified as inactive and if so
 * fires a callback.
 */
export const useEditLockInactiveUser = ({
  onOwnerIdleTimeout,
}: {
  onOwnerIdleTimeout?: () => void;
} = {}) => {
  const timeoutRef = useRef<number | null>(null);
  const lastTimerResetAtRef = useRef(0);
  const [isOwnerIdleTimeExpired, setIsOwnerIdleTimeExpired] = useState(false);

  const startOwnerIdleTimer = (force = false) => {
    const now = Date.now();

    if (
      !force &&
      timeoutRef.current &&
      now - lastTimerResetAtRef.current < OWNER_IDLE_TIMER_RESET_THROTTLE_MS
    ) {
      return;
    }

    setIsOwnerIdleTimeExpired(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    lastTimerResetAtRef.current = now;
    timeoutRef.current = window.setTimeout(() => {
      setIsOwnerIdleTimeExpired(true);
      timeoutRef.current = null;
      onOwnerIdleTimeout?.();
    }, CLIENT_SIDE_EDIT_LOCK_INACTIVE_TIMEOUT_MS);
  };

  const clearOwnerIdleTimer = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    lastTimerResetAtRef.current = 0;
    setIsOwnerIdleTimeExpired(false);
  };

  return { startOwnerIdleTimer, clearOwnerIdleTimer, isOwnerIdleTimeExpired };
};
