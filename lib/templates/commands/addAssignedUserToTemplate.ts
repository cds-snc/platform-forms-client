import { prisma, prismaErrors } from "@gcforms/database";
import { FormProperties } from "@lib/types";
import { authorization } from "../../privileges";
import {
  AuditLogAccessDeniedDetails,
  AuditLogDetails,
  AuditLogEvent,
  logEvent,
} from "../../auditLogs";
import { logMessage } from "@lib/logger";
import { TemplateNotFoundError, UserNotFoundError } from "../internal/errors";
import { invalidateTemplateEditLockUserCountCache } from "../../editLocks";
import { notifyOwnersOwnerAdded } from "../internal/notifications";

/**
 * Assign a user to a form
 *
 * @param ability
 * @param formID
 * @param userID
 */
export async function addAssignedUserToTemplate(formID: string, userID: string): Promise<void> {
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
    logMessage.warn(`Can not add user ${userID} to template ${formID}.  Template does not exist`);
    throw new TemplateNotFoundError();
  }

  const userToAdd = template.users.find((user) => user.id === userID);

  if (!userToAdd) {
    logMessage.warn(`Can not add user ${userID} to template ${formID}.  User does not exist`);
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
          connect: {
            id: userID,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  // No changes
  if (updatedTemplate === null) return;

  await invalidateTemplateEditLockUserCountCache(formID);

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.InvitationAccepted,
    AuditLogDetails.AcceptedInvitation,
    { userEmail: user.email }
  );

  notifyOwnersOwnerAdded(
    userToAdd,
    updatedTemplate.jsonConfig as FormProperties,
    updatedTemplate.users
  );
}
