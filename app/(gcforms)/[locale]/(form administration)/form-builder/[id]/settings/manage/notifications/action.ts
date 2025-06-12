"use server";

import { AuthenticatedAction } from "@root/lib/actions";
import { logMessage } from "@root/lib/logger";
import { getNotificationsUsers } from "@root/lib/notifications";
import { ServerActionError } from "@root/lib/types/form-builder-types";

export const getNotificationsSettings = AuthenticatedAction(async (session, formId: string) => {
  try {
    const notificationsUsers = await getNotificationsUsers(formId);

    // TODO case of no users is possible on older I think so allow?
    // if (!Array.isArray(notificationsUsers) || notificationsUsers.length === 0) {
    //   throw new Error("No notifications users found");
    // }

    const sessionUser = notificationsUsers?.find((user) => user.email === session.user.email);

    // TODO case of no users is possible on older I think so allow?
    // if (!sessionUser) {
    //   throw new Error("Session user not found in notifications users");
    // }

    return {
      users: notificationsUsers,
      sessionUser,
    };
  } catch (error) {
    logMessage.warn(`Error fetching notifications settings: ${(error as Error).message}`);
    return {
      error: (error as Error).message || "There was an error. Please try again later.",
    } as ServerActionError;
  }
});
