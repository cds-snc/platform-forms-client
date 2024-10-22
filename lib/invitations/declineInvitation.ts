import { prisma } from "@lib/integration/prismaConnector";
import { UserAbility } from "@lib/types";
import { InvitationNotFoundError, UserNotFoundError } from "./exceptions";
import { getUser } from "@lib/users";
import { logEvent } from "@lib/auditLogs";
import { checkPrivileges } from "@lib/privileges";

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

  const user = await getUser(ability, ability.userID).catch(() => {
    throw new UserNotFoundError();
  });

  // Ensures the logged in user is the user that was invited
  checkPrivileges(ability, [
    { action: "view", subject: { type: "User", object: { id: user.id } } },
  ]);

  await _deleteInvitation(invitationId);

  logEvent(
    ability.userID,
    { type: "Form", id: invitation.templateId },
    "InvitationDeclined",
    `${user.id} has declined an invitation`
  );
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
