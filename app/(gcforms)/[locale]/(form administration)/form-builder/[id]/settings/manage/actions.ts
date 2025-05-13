"use server";

import {
  getThrottling,
  setThrottlingExpiry,
  setPermanentThrottling,
  resetThrottling,
} from "@lib/cache/throttlingCache";
import { AuthenticatedAction } from "@lib/actions";
import { ServerActionError } from "@lib/types/form-builder-types";
import { logEvent } from "@lib/auditLogs";
import { updateNotificationsSetting } from "@lib/templates";
import { removeMarker } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/notifications";
import { NotificationsInterval } from "@gcforms/types";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getCurrentThrottlingRate = AuthenticatedAction(async (_, formId: string) => {
  return getThrottling(formId).catch(() => {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  });
});

export const temporarilyIncreaseThrottlingRate = AuthenticatedAction(
  async (session, formId: string, weeks: number) => {
    try {
      await setThrottlingExpiry(formId, weeks);

      logEvent(
        session.user.id,
        { type: "ServiceAccount" },
        "IncreaseThrottlingRate",
        `User :${session.user.id} increased throttling rate on form ${formId} for ${weeks} week(s)`
      );
    } catch (error) {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);

export const permanentlyIncreaseThrottlingRate = AuthenticatedAction(
  async (session, formId: string) => {
    try {
      await setPermanentThrottling(formId);

      logEvent(
        session.user.id,
        { type: "ServiceAccount" },
        "IncreaseThrottlingRate",
        `User :${session.user.id} permanently increased throttling rate on form ${formId}`
      );
    } catch (error) {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);

export const resetThrottlingRate = AuthenticatedAction(async (session, formId: string) => {
  try {
    await resetThrottling(formId);

    logEvent(
      session.user.id,
      { type: "ServiceAccount" },
      "ResetThrottlingRate",
      `User :${session.user.id} reset throttling rate on form ${formId}`
    );
  } catch (error) {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  }
});

export const updateNotificationsInterval = AuthenticatedAction(
  async (_, formId: string, notificationsInterval: NotificationsInterval) => {
    try {
      await Promise.all([
        updateNotificationsSetting(formId, notificationsInterval),
        // Remove old cache value to allow a new one with the new ttl to be created when the next submission is sent
        removeMarker(formId),
      ]);
    } catch (_) {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);
