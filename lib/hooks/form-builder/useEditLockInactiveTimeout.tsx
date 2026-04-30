"use client";

import { useRef, useState } from "react";
import {
  CLIENT_SIDE_EDIT_LOCK_INACTIVE_TIMEOUT_MS, // TODO update to use app setting
} from "@lib/formBuilderEditLockPresence";

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
  const [isOwnerIdleTimeExpired, setIsOwnerIdleTimeExpired] = useState(false);

  const startOwnerIdleTimer = () => {
    setIsOwnerIdleTimeExpired(false);
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
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
    setIsOwnerIdleTimeExpired(false);
  };

  return { startOwnerIdleTimer, clearOwnerIdleTimer, isOwnerIdleTimeExpired };
};
