"use client";

import { useRef } from "react";
import {
  CLIENT_SIDE_EDIT_LOCK_INACTIVE_TIMEOUT_MS, // TODO update to use app setting
} from "@lib/formBuilderEditLockPresence";

/**
 * Keeps track of whether a user is identified as inactive and if so
 * fires a callback.
 */
export const useEditLockInactiveUser = () => {
  const timeoutRef = useRef<number | null>(null);
  const isOwnerIdleTimeExpired = useRef<boolean>(false);

  const startOwnerIdleTimer = () => {
    isOwnerIdleTimeExpired.current = false;
    timeoutRef.current = window.setInterval(() => {
      // console.log("~~~~~JAVASCRIPT TIMER");
      isOwnerIdleTimeExpired.current = true;
    }, CLIENT_SIDE_EDIT_LOCK_INACTIVE_TIMEOUT_MS);
  };

  const clearOwnerIdleTimer = () => {
    if (timeoutRef.current) {
      // console.log("~~~~~CLEARING TIMER");
      window.clearInterval(timeoutRef.current);
      timeoutRef.current = null;
      isOwnerIdleTimeExpired.current = false;
    }
  };

  return { startOwnerIdleTimer, clearOwnerIdleTimer, isOwnerIdleTimeExpired };
};
