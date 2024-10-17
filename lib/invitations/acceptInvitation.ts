import { prisma } from "@lib/integration/prismaConnector";
import { FormProperties, UserAbility } from "@lib/types";
import { InvitationIsExpiredError, InvitationNotFoundError, UserNotFoundError } from "./exceptions";
import { checkPrivileges } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import { notifyOwnersOfNewOwnership } from "@lib/templates";

/**
 * Accept an invitation.
 * User has created their account or logged into their existing account.
 *
 * @param ability (logged in user)
 * @param invitationId
 * @returns
 */
export const acceptInvitation = async (ability: UserAbility, invitationId: string) => {
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

  if (user) {
    // Ensures the logged in user is the user that was invited
    checkPrivileges(ability, [
      { action: "view", subject: { type: "User", object: { id: user.id } } },
    ]);

    // assign user to form
    const updatedTemplate = await _assignUserToTemplate(user.id, invitation.templateId);

    _deleteInvitation(invitationId);

    notifyOwnersOfNewOwnership(
      user.name || user.email,
      updatedTemplate.jsonConfig as FormProperties,
      updatedTemplate.users
    );

    logEvent(
      ability.userID,
      { type: "Form", id: invitation.templateId },
      "InvitationAccepted",
      `${user.id} has accepted an invitation`
    );

    return true;
  }

  throw new UserNotFoundError();
};

/**
 * Assign user to template
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
  await prisma.invitation.delete({
    where: {
      id,
    },
  });
};
