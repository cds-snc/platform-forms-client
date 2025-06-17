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
import { updateNotificationsUser } from "@root/lib/notifications";
import { logMessage } from "@root/lib/logger";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";

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

export const updateNotificationsUserSetting = AuthenticatedAction(
  async (_, formId: string, user: { id: string; email: string; enabled: boolean } | null) => {
    try {
      if (!user || !user.id) {
        logMessage.warn("No user provided for notifications settings update");
        throw new Error();
      }

      await updateNotificationsUser(formId, user.enabled);
    } catch (_) {
      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);

export const getNotificationsUsers = AuthenticatedAction(async (session, formId: string) => {
  try {
    const usersAndNotificationsUsers = await prisma.template
      .findUnique({
        where: {
          id: formId,
        },
        select: {
          users: {
            select: {
              id: true,
              email: true,
            },
          },
          notificationsUsers: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      })
      .catch((e) => prismaErrors(e, null));
    if (!usersAndNotificationsUsers) {
      logMessage.warn(`getNotificationsUsers template not found with id ${formId}`);
      throw new Error("Template not found");
    }
    const { users, notificationsUsers } = usersAndNotificationsUsers;

    const usersWithSetting = users.map((user) => {
      const found = notificationsUsers.find((notificationUser) => notificationUser.id === user.id);
      return {
        id: user.id,
        email: user.email,
        enabled: found ? true : false,
      };
    });
    const sessionsUser = usersWithSetting.find((user) => user.id === session.user.id);
    const usersWithoutSessionUser =
      usersWithSetting.filter((user) => user.id !== session.user.id) || [];

    return {
      users: usersWithoutSessionUser,
      sessionUserWithSetting: sessionsUser,
    };
  } catch (error) {
    logMessage.warn(`Error fetching notifications settings: ${(error as Error).message}`);
    return {
      error: (error as Error).message || "There was an error. Please try again later.",
    } as ServerActionError;
  }
});
