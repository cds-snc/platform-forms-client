import { prisma } from "@lib/integration/prismaConnector";

import { InvitationNotFoundError, UserNotFoundError } from "./exceptions";
import { getUser } from "@lib/users";
import { logEvent } from "@lib/auditLogs";
import { getAbility } from "@lib/privileges";
import { logMessage } from "@lib/logger";
import { AccessControlError } from "@lib/auth/errors";

/**
 * Decline an invitation
 *
 * @param ability
 * @param invitationId
 * @returns
 */
export const declineInvitation = async (invitationId: string) => {
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
  });

  if (!invitation) {
    throw new InvitationNotFoundError();
  }
  const ability = await getAbility();

  const user = await getUser(ability.user.id).catch(() => {
    throw new UserNotFoundError();
  });

  // Ensures the logged in user is the user that was invited
  if (ability.user.id !== user.id) {
    throw new AccessControlError("You do not have permission to decline this invitation");
  }

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
