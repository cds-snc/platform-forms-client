import { authorization } from "@lib/privileges";
import {
  AuditLogAccessDeniedDetails,
  AuditLogDetails,
  AuditLogEvent,
  logEvent,
} from "@lib/auditLogs";
import { prisma, prismaErrors } from "@gcforms/database";
import { logMessage } from "@lib/logger";
import { TemplateNotFoundError, UserNotFoundError } from "../internal/errors";
import { invalidateTemplateEditLockUserCountCache } from "@lib/editLocks";
import { notifyOwnerRemoved } from "../internal/notifications";
import { FormProperties } from "@lib/types";

/**
 * Remove a user from a form
 *
 * @param formID Form ID
 * @param userID User to be removed ID
 */
export async function removeAssignedUserFromTemplate(
  formID: string,
  userID: string
): Promise<void> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToRemoveAssignedUser
    );
    throw e;
  });

  const template = await prisma.template.findUnique({
    where: {
      id: formID,
    },
    select: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (template === null) {
    logMessage.warn(
      `Can not remove assigned user ${userID} on template ${formID}.  Template does not exist`
    );
    throw new TemplateNotFoundError();
  }

  const userToRemove = template.users.find((user) => user.id === userID);

  if (!userToRemove) {
    logMessage.warn(
      `Can not remove assigned user ${userID} on template ${formID}.  User is not assigned`
    );
    throw new UserNotFoundError();
  }

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      select: {
        jsonConfig: true,
        users: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      data: {
        users: {
          disconnect: {
            id: userID,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return;

  await invalidateTemplateEditLockUserCountCache(formID);

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.RevokeFormAccess,
    AuditLogDetails.AccessRevokedFor,
    { userList: userToRemove.email }
  );

  notifyOwnerRemoved(
    userToRemove,
    updatedTemplate.jsonConfig as FormProperties,
    updatedTemplate.users
  );
}
