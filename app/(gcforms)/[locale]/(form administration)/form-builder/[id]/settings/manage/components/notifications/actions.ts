"use server";

import { AuthenticatedAction } from "@lib/actions";
import { ServerActionError } from "@lib/types/form-builder-types";
import { prisma, prismaErrors } from "@gcforms/database";
import {
  AuditLogDetails,
  logEvent,
  AuditLogEvent,
  AuditLogAccessDeniedDetails,
} from "@root/lib/auditLogs";
import { authorization } from "@root/lib/privileges";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const updateNotificationsUser = AuthenticatedAction(
  async (session, formId: string, enabled: boolean) => {
    try {
      await authorization.canEditForm(formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateEmailNotifications
        );
        throw e;
      });

      await prisma.template
        .update({
          where: {
            id: formId,
          },
          data: {
            notificationsUsers: {
              ...(enabled
                ? { connect: { id: session.user.id } }
                : { disconnect: { id: session.user.id } }),
            },
          },
        })
        .catch((e) => prismaErrors(e, null));

      logEvent(
        session.user.id,
        { type: "Form", id: formId },
        AuditLogEvent.UpdatedNotificationSettings,
        AuditLogDetails.UpdatedNotificationSettings,
        {
          userId: session.user.id,
          formId,
          enabled: enabled ? "enabled" : "disabled",
          userEmail: session.user.email,
        }
      );
    } catch (_) {
      return {
        error: "There was an error. Please try again later.",
      } as ServerActionError;
    }
  }
);
