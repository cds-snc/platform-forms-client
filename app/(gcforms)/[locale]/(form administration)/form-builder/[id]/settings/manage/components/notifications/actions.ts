"use server";

import { AuthenticatedAction } from "@lib/actions";
import { ServerActionError } from "@lib/types/form-builder-types";
import { logMessage } from "@root/lib/logger";
import { prisma, prismaErrors } from "@gcforms/database";
import { AuditLogDetails, logEvent } from "@root/lib/auditLogs";

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
        {
          userId: session.user.id,
          formId,
          enabled: user.enabled ? "enabled" : "disabled",
        }
      );
    } catch (_) {
      return {
        error: "There was an error. Please try again later.",
      } as ServerActionError;
    }
  }
);
