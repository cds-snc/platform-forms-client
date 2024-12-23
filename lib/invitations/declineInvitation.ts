import { prisma } from "@lib/integration/prismaConnector";
import { UserAbility } from "@lib/types";
import { InvitationNotFoundError, UserNotFoundError } from "./exceptions";
import { getUser } from "@lib/users";
import { logEvent } from "@lib/auditLogs";
import { checkPrivileges } from "@lib/privileges";
import { logMessage } from "@lib/logger";

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

  const user = await getUser(ability, ability.user.id).catch(() => {
    throw new UserNotFoundError();
  });

  // Ensures the logged in user is the user that was invited
  checkPrivileges(ability, [
    { action: "view", subject: { type: "User", object: { id: user.id } } },
  ]);

  _deleteInvitation(invitationId).catch((e) => {
    logMessage.error(`Error deleting invitation: ${e}`);
  });

  logEvent(
    ability.user.id,
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
