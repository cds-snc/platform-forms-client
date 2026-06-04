import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord, FormProperties } from "@lib/types";

import { authorization } from "../privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "../auditLogs";
import { logMessage } from "@lib/logger";
import { invalidateTemplateEditLockUserCountCache } from "../editLocks";
import { notifyOwnersOwnerAdded, notifyOwnersOwnerRemoved } from "./notifications";
import { parseTemplate } from "./shared";

/**
 * Add/remove (sync) users to a form
 *
 * @param ability
 * @param formID
 * @param users
 */
export async function updateAssignedUsersForTemplate(
  formID: string,
  users: { id: string }[]
): Promise<FormRecord | null> {
  if (!users.length) throw new Error("No users provided");
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetAssignedUsers
    );
    throw e;
  });

  const template = await prisma.template
    .findFirst({
      where: {
        id: formID,
      },
      include: {
        users: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (template === null) {
    logMessage.warn(
      `Can not update assigned users ${JSON.stringify(
        users
      )} on template ${formID}.  Template does not exist`
    );
    return null;
  }

  const previouslyAssigned =
    template?.users.map((user) => {
      return { id: user.id };
    }) || [];

  const toAdd = users.filter((n) => !previouslyAssigned.some((n2) => n.id == n2.id));
  const toRemove = previouslyAssigned.filter((n) => !users.some((n2) => n.id == n2.id));

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        users: {
          connect: toAdd,
          disconnect: toRemove,
        },
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        securityAttribute: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        users: true,
        saveAndResume: true,
        notificationsInterval: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  await invalidateTemplateEditLockUserCountCache(formID);

  const getUsersFromUserIds = (userIds: string[]) => {
    return Promise.all(
      userIds.map((userId) => {
        return prisma.user.findUniqueOrThrow({
          where: {
            id: userId,
          },
        });
      })
    );
  };

  const usersToAdd = await getUsersFromUserIds(toAdd.map((u) => u.id));

  usersToAdd.forEach((user) => {
    notifyOwnersOwnerAdded(
      user,
      updatedTemplate.jsonConfig as FormProperties,
      updatedTemplate.users
    );
  });

  const usersToRemove = await getUsersFromUserIds(toRemove.map((u) => u.id));

  usersToRemove.forEach((user) => {
    notifyOwnersOwnerRemoved(
      user,
      updatedTemplate.jsonConfig as FormProperties,
      updatedTemplate.users
    );
  });

  usersToAdd.length > 0 &&
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "GrantFormAccess",
      AuditLogDetails.AccessGrantedTo,
      { userList: usersToAdd.map((user) => user.email ?? user.id).toString() }
    );

  usersToRemove.length > 0 &&
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "RevokeFormAccess",
      AuditLogDetails.AccessRevokedFor,
      { userList: usersToRemove.map((user) => user.email ?? user.id).toString() }
    );

  return parseTemplate(updatedTemplate);
}
