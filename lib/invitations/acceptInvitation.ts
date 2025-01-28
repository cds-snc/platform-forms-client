import { prisma } from "@lib/integration/prismaConnector";
import { FormProperties } from "@lib/types";
import {
  InvitationIsExpiredError,
  InvitationNotFoundError,
  UnableToAssignUserToTemplateError,
  UserNotFoundError,
} from "./exceptions";
import { getAbility } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import { notifyOwnersOwnerAdded } from "@lib/templates";
import { logMessage } from "@lib/logger";
import { AccessControlError } from "@lib/auth/errors";

/**
 * Accept an invitation.
 * User has created their account or logged into their existing account.
 *
 * @param invitationId
 * @returns
 */
export const acceptInvitation = async (invitationId: string) => {
  // Retrieve the invitation
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  // If no invitation found, return an error
  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  // Check if the invitation has expired
  const now = new Date();
  if (invitation.expires < now) {
    throw new InvitationIsExpiredError();
  }

  const user = await prisma.user.findFirst({
    where: {
      email: invitation.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  // Ensures the logged in user is the user that was invited
  const ability = await getAbility();
  if (ability.user.id !== user.id) {
    throw new AccessControlError(
      ability.user.id,
      "You do not have permission to accept this invitation"
    );
  }

  // assign user to form
  const updatedTemplate = await _assignUserToTemplate(user.id, invitation.templateId).catch((e) => {
    logMessage.error(`Error assigning user to form: ${e}`);
    throw new UnableToAssignUserToTemplateError();
  });

  logEvent(
    ability.user.id,
    { type: "Form", id: invitation.templateId },
    "InvitationAccepted",
    `${user.id} has accepted an invitation`
  );

  // some existing events may not yet have the 'invitedBy' attribute.
  // fallback to previous behavior

  logEvent(
    invitation.invitedBy ?? ability.user.id,
    { type: "Form", id: invitation.templateId },
    "GrantFormAccess",
    `Access granted to ${user.id}`
  );

  notifyOwnersOwnerAdded(user, updatedTemplate.jsonConfig as FormProperties, updatedTemplate.users);

  _deleteInvitation(invitationId).catch((e) => {
    logMessage.error(`Error deleting invitation: ${e}`);
  });
};

/**
 * Assign user to template
 * This private function is used over the common templates.ts/assignUserToTemplate
 * because that exported function requires a privilege check that won't work here.
 *
 * @param userId
 * @param formId
 */
const _assignUserToTemplate = async (userId: string, formId: string) => {
  return prisma.template.update({
    where: {
      id: formId,
    },
    data: {
      users: {
        connect: {
          id: userId,
        },
      },
    },
    select: {
      jsonConfig: true,
      users: true,
    },
  });
};

/**
 * Delete an invitation
 *
 * @param id
 */
const _deleteInvitation = async (id: string) => {
  return prisma.invitation.delete({
    where: {
      id,
    },
  });
};
