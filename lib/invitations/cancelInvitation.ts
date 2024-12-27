import { prisma } from "@lib/integration/prismaConnector";
import { InvitationNotFoundError } from "./exceptions";
import { authorization } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import { AccessControlError } from "@lib/auth/errors";

/**
 * Cancel an invitation
 *
 * @param ability
 * @param invitationId
 */
export const cancelInvitation = async (invitationId: string) => {
  // Retrieve the invitation
  const invitation = await prisma.invitation.findUnique({
    where: {
      id: invitationId,
    },
    select: {
      email: true,
      templateId: true,
    },
  });

  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  const { user } = await authorization.canEditForm(invitation.templateId).catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "Form", id: invitation.templateId },
        "AccessDenied",
        `User ${e.user.id} does not have permission to cancel invitation`
      );
    }
    throw e;
  });

  // Delete the invitation
  await _deleteInvitation(invitationId);

  logEvent(
    user.id,
    { type: "Form", id: invitation.templateId },
    "InvitationCancelled",
    `${user.id} cancelled invitation for ${invitation.email}`
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
