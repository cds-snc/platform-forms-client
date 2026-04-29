"use client";

import { useCallback, useEffect, useRef } from "react";
import { useActiveTab } from "@lib/hooks/form-builder/useActiveTab";
import {
  CLIENT_SIDE_EDIT_LOCK_ACTIVITY_THROTTLE_MS,
  CLIENT_SIDE_EDIT_LOCK_AWAY_MS,
  CLIENT_SIDE_EDIT_LOCK_IDLE_MS,
  EDIT_LOCK_REDIRECT_IDLE_FALLBACK_MS,
} from "@lib/formBuilderEditLockPresence";
import { type EditLockPresenceStatus, type EditLockVisibilityState } from "@lib/editLockStatus";

type EditLockActivitySnapshot = {
  lastActivityAt: string;
  visibilityState: EditLockVisibilityState;
  presenceStatus: EditLockPresenceStatus;
};

const getVisibilityState = (): EditLockVisibilityState =>
  document.visibilityState === "hidden" ? "hidden" : "visible";

const getPresenceStatus = (
  visibilityState: EditLockVisibilityState,
  idleMs: number
): EditLockPresenceStatus => {
  if (visibilityState === "hidden" || idleMs >= CLIENT_SIDE_EDIT_LOCK_AWAY_MS) {
    return "away";
  }

  if (idleMs >= CLIENT_SIDE_EDIT_LOCK_IDLE_MS) {
    return "idle";
  }

  return "active";
};

export const useEditLockPresence = ({
  enabled,
  coordinationKey,
  activeTabEnabled = false,
  idleTimeoutMs = EDIT_LOCK_REDIRECT_IDLE_FALLBACK_MS,
  onIdleTimeout,
}: {
  enabled: boolean;
  coordinationKey: string;
  activeTabEnabled?: boolean;
  idleTimeoutMs?: number;
  onIdleTimeout?: () => void;
}) => {
  "use memo";
  const { isActiveTab } = useActiveTab({
    enabled: enabled && activeTabEnabled,
    coordinationKey,
  });
  const lastActivityAtRef = useRef(0);
  const idleTimeoutRef = useRef<number | null>(null);
  const idleTimeoutTriggeredRef = useRef(false);
  const visibilityStateRef = useRef<EditLockVisibilityState>("visible");

  const isTrackingPresence = enabled && (!activeTabEnabled || isActiveTab);

  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);

  const getIdleMs = useCallback(() => {
    const lastActivityAt = lastActivityAtRef.current || Date.now();
    return Date.now() - lastActivityAt;
  }, []);

  const checkIdleTimeout = useCallback(() => {
    if (!onIdleTimeout || idleTimeoutTriggeredRef.current || getIdleMs() < idleTimeoutMs) {
      return false;
    }

    idleTimeoutTriggeredRef.current = true;
    clearIdleTimeout();
    onIdleTimeout();
    return true;
  }, [clearIdleTimeout, getIdleMs, idleTimeoutMs, onIdleTimeout]);

  const scheduleIdleTimeout = useCallback(
    function scheduleIdleTimeout() {
      clearIdleTimeout();

      if (!enabled || !onIdleTimeout || idleTimeoutTriggeredRef.current) {
        return;
      }

      const remainingMs = Math.max(idleTimeoutMs - getIdleMs(), 0);
      idleTimeoutRef.current = window.setTimeout(() => {
        if (!checkIdleTimeout()) {
          scheduleIdleTimeout();
        }
      }, remainingMs);
    },
    [checkIdleTimeout, clearIdleTimeout, enabled, getIdleMs, idleTimeoutMs, onIdleTimeout]
  );

  useEffect(() => {
    if (!enabled) {
      clearIdleTimeout();
      return;
    }

    if (!lastActivityAtRef.current) {
      lastActivityAtRef.current = Date.now();
    }

    if (checkIdleTimeout()) {
      return () => {
        clearIdleTimeout();
      };
    }

    scheduleIdleTimeout();

    return () => {
      clearIdleTimeout();
    };
  }, [checkIdleTimeout, clearIdleTimeout, enabled, scheduleIdleTimeout]);

  const markActivity = useCallback((force = false) => {
    const nextVisibilityState = getVisibilityState();
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
    idleTimeoutTriggeredRef.current = false;
  }, []);

  const getActivitySnapshot = useCallback((): EditLockActivitySnapshot | undefined => {
    if (!isTrackingPresence) {
      return;
    }

    const now = Date.now();
    const lastActivityAt = lastActivityAtRef.current || now;
    const visibilityState = visibilityStateRef.current;
    const idleMs = now - lastActivityAt;

    return {
      lastActivityAt: new Date(lastActivityAt).toISOString(),
      visibilityState,
      presenceStatus: getPresenceStatus(visibilityState, idleMs),
    };
  }, [isTrackingPresence]);

  useEffect(() => {
    if (!isTrackingPresence) {
      return;
    }

    const handleVisibilityChange = () => {
      visibilityStateRef.current = getVisibilityState();

      if (visibilityStateRef.current === "visible") {
        if (checkIdleTimeout()) {
          return;
        }

        markActivity(true);
      }

      scheduleIdleTimeout();
    };

    const handleActivity = () => {
      if (checkIdleTimeout()) {
        return;
      }

      markActivity();
      scheduleIdleTimeout();
    };

    if (!lastActivityAtRef.current) {
      markActivity(true);
    } else if (checkIdleTimeout()) {
      return () => {
        clearIdleTimeout();
      };
    }

    scheduleIdleTimeout();

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
      clearIdleTimeout();
    };
  }, [checkIdleTimeout, clearIdleTimeout, isTrackingPresence, markActivity, scheduleIdleTimeout]);

  return { getActivitySnapshot };
};
