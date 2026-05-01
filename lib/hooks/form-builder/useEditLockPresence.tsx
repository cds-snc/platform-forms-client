"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  CLIENT_SIDE_EDIT_LOCK_ACTIVITY_THROTTLE_MS,
  CLIENT_SIDE_EDIT_LOCK_AWAY_MS,
  CLIENT_SIDE_EDIT_LOCK_IDLE_MS,
} from "@root/constants";
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
  getIsActiveTab,
  onActivity,
}: {
  getIsActiveTab: () => boolean;
  onActivity?: (lastActivityAt: number) => void;
}) => {
  "use memo";
  const lastActivityAtRef = useRef(0);
  const visibilityStateRef = useRef<EditLockVisibilityState>("visible");

  const isTrackingPresence = getIsActiveTab();

  const markActivity = useCallback(
    (force = false) => {
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
      onActivity?.(now);
    },
    [onActivity]
  );

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
  }, [isTrackingPresence, markActivity]);

  return { getActivitySnapshot, getIsActiveTab };
};
