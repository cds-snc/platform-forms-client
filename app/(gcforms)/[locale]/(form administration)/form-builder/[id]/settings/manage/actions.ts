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
import { getNotificationsSettings, updateNotificationsSettings } from "@root/lib/notifications";
import { logMessage } from "@root/lib/logger";

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

export const saveNotificationsSettings = AuthenticatedAction(
  async (_, formId: string, user: { email: string; enabled: boolean } | null) => {
    try {
      if (!user || !user.email) {
        logMessage.warn("No user provided for notifications settings update");
        throw new Error();
      }

      await updateNotificationsSettings(formId, user);
    } catch (_) {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);

export const getNotificationsUsersAndSettings = AuthenticatedAction(
  async (session, formId: string) => {
    try {
      const notificationsSettings = await getNotificationsSettings(formId);

      // TODO case of no users is possible on older I think so allow?
      // if (!Array.isArray(notificationsUsers) || notificationsUsers.length === 0) {
      //   throw new Error("No notifications users found");
      // }

      const sessionUser = notificationsSettings?.users.find(
        (user) => user.email === session.user.email
      );

      const usersWithoutSessionUser =
        notificationsSettings?.users.filter((user) => user.email !== session.user.email) || [];

      // TODO case of no users is possible on older I think so allow?
      // if (!sessionUser) {
      //   throw new Error("Session user not found in notifications users");
      // }

      return {
        users: usersWithoutSessionUser,
        sessionUser,
      };
    } catch (error) {
      logMessage.warn(`Error fetching notifications settings: ${(error as Error).message}`);
      return {
        error: (error as Error).message || "There was an error. Please try again later.",
      } as ServerActionError;
    }
  }
);
