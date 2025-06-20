"use server";

import { AuthenticatedAction } from "@lib/actions";
import { ServerActionError } from "@lib/types/form-builder-types";
import { logMessage } from "@root/lib/logger";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { updateNotificationsUser } from "@root/lib/notifications";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const updatSessionUserSetting = AuthenticatedAction(
  async (_, formId: string, user: { id: string; email: string; enabled: boolean } | null) => {
    try {
      if (!user || !user.id) {
        logMessage.warn("No user provided for notifications settings update");
        throw new Error();
      }

      await updateNotificationsUser(formId, user.enabled);
    } catch (_) {
      return {
        error: "There was an error. Please try again later.",
      } as ServerActionError;
    }
  }
);

export const getSessionUserWithSetting = AuthenticatedAction(async (session, formId: string) => {
  try {
    const users = await getNotificationsUsers(formId);
    if ("error" in users || !users) {
      throw new Error(users.error);
    }

    return users.find((user) => user.id === session?.user.id) || null;
  } catch (error) {
    logMessage.warn(`Error fetching notifications user with setting: ${(error as Error).message}`);
    return {
      error: (error as Error).message || "There was an error. Please try again later.",
    } as ServerActionError;
  }
});

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

    return users.map((user) => {
      const found = notificationsUsers.find((notificationUser) => notificationUser.id === user.id);
      return {
        id: user.id,
        email: user.email,
        enabled: found ? true : false,
      };
    });
  } catch (error) {
    return {
      error: (error as Error).message || "There was an error. Please try again later.",
    } as ServerActionError;
  }
});
