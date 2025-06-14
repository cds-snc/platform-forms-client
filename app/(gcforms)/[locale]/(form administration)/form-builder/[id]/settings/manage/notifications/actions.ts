"use server";

import { AuthenticatedAction } from "@root/lib/actions";
import { logMessage } from "@root/lib/logger";
import { getNotificationsSettings, updateNotificationsSettings } from "@root/lib/notifications";
import { ServerActionError } from "@root/lib/types/form-builder-types";

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
