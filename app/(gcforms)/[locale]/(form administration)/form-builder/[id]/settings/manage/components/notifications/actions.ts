"use server";

import { AuthenticatedAction } from "@lib/actions";
import { ServerActionError } from "@lib/types/form-builder-types";
import { logMessage } from "@root/lib/logger";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { AuditLogDetails, logEvent } from "@root/lib/auditLogs";
import { getNotificationsUsers } from "@root/lib/notifications";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const updateNotificationsUser = AuthenticatedAction(
  async (session, formId: string, user: { id: string; email: string; enabled: boolean } | null) => {
    try {
      if (!user || !user.id) {
        logMessage.warn("No user provided for notifications settings update");
        throw new Error();
      }

      await prisma.template
        .update({
          where: {
            id: formId,
          },
          data: {
            notificationsUsers: {
              ...(user.enabled
                ? { connect: { id: user.id, email: user.email } }
                : { disconnect: { id: user.id } }),
            },
          },
        })
        .catch((e) => prismaErrors(e, null));

      logEvent(
        session.user.id,
        { type: "Form", id: formId },
        "UpdateNotificationsUserSetting",
        AuditLogDetails.UpdatedNotificationSettings,
        { userId: session.user.id, formId, enabled: user.enabled ? "enabled" : "disabled" }
      );
    } catch (_) {
      return {
        error: "There was an error. Please try again later.",
      } as ServerActionError;
    }
  }
);

export const getNotificationsUser = AuthenticatedAction(async (session, formId: string) => {
  try {
    const userId = session?.user.id;

    const template = await prisma.template
      .findFirst({
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

    if (template === null) {
      logMessage.warn(
        `Can not notifications setting for user with id ${userId}
          on template ${formId}. Template does not exist`
      );
      return null;
    }

    // A user can only update their own notifications settings
    const user = template.users.find((u) => u.id === userId);
    if (!user) {
      logMessage.warn(
        `Cannot find notifications setting for user with id ${userId}
          on template ${formId}. User does not exist`
      );
      return null;
    }

    // User has notifications enabled if they are in the notificationsUsers list
    const usersAndNotificationsUsers = template.notificationsUsers.find((u) => u.id === userId);

    return {
      id: user.id,
      email: user.email,
      enabled: usersAndNotificationsUsers ? true : false,
    };
  } catch (error) {
    logMessage.warn(`Error fetching notifications user with setting: ${(error as Error).message}`);
    return {
      error: (error as Error).message || "There was an error. Please try again later.",
    } as ServerActionError;
  }
});

export const getNotificationsUsersList = AuthenticatedAction(async (session, formId: string) => {
  try {
    return await getNotificationsUsers(formId);
  } catch (error) {
    return {
      error: (error as Error).message || "There was an error. Please try again later.",
    } as ServerActionError;
  }
});
