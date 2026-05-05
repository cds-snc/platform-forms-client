"use client";

import { useRef, useState } from "react";
import { normalizeEditLockRedirectIdleMs } from "@lib/utils/form-builder/editLockRedirectIdleMs";

/**
 * Keeps track of whether a user is identified as inactive and if so
 * fires a callback.
 */
export const useEditLockInactiveUser = ({
  ownerIdleTimeoutMs,
  onOwnerIdleTimeout,
}: {
  ownerIdleTimeoutMs?: number;
  onOwnerIdleTimeout?: () => void;
} = {}) => {
  const timeoutRef = useRef<number | null>(null);
  const lastTimerResetAtRef = useRef(0);
  const [isOwnerIdleTimeExpired, setIsOwnerIdleTimeExpired] = useState(false);
  const normalizedOwnerIdleTimeoutMs = normalizeEditLockRedirectIdleMs(ownerIdleTimeoutMs);
  const ownerIdleTimerResetThrottleMs = Math.min(normalizedOwnerIdleTimeoutMs / 2, 5_000);

  const startOwnerIdleTimer = (force = false) => {
    const now = Date.now();

    if (
      !force &&
      timeoutRef.current &&
      now - lastTimerResetAtRef.current < ownerIdleTimerResetThrottleMs
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
    }, normalizedOwnerIdleTimeoutMs);
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
