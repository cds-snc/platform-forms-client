import { prisma } from "@lib/integration/prismaConnector";
import { UserAbility } from "@lib/types";
import { InvitationNotFoundError, UserNotFoundError } from "./exceptions";
import { getUser } from "@lib/users";
import { logEvent } from "@lib/auditLogs";

/**
 * Decline an invitation
 *
 * @param ability
 * @param invitationId
 * @returns
 */
export const declineInvitation = async (ability: UserAbility, invitationId: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  const user = await getUser(ability, ability.userID);

  if (!user) {
    throw new UserNotFoundError();
  }

  // Check if the user is the same as the one who received
  // the invitation. If so, delete the invitation
  if (user.email === invitation.email) {
    await _deleteInvitation(invitationId);

    logEvent(
      ability.userID,
      { type: "Form", id: invitation.templateId },
      "InvitationDeclined",
      `${user.id} has declined an invitation`
    );
  }
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
