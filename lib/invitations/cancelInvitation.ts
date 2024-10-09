import { prisma } from "@lib/integration/prismaConnector";
import { InvitationNotFoundError } from "./exceptions";
import { checkPrivileges } from "@lib/privileges";
import { UserAbility } from "@lib/types";

/**
 * Cancel an invitation
 *
 * @param ability
 * @param invitationId
 */
export const cancelInvitation = async (ability: UserAbility, invitationId: string) => {
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

  checkPrivileges(ability, [
    { action: "update", subject: { type: "FormRecord", object: { id: invitation.templateId } } },
  ]);

  // If no invitation found, return an error
  if (!invitation) {
    throw new InvitationNotFoundError();
  }

  // Delete the invitation
  await _deleteInvitation(invitationId);
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
