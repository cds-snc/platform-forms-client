import { prisma } from "@lib/integration/prismaConnector";
import { InvitationNotFoundError, TemplateNotFoundError } from "./exceptions";
import { checkPrivileges } from "@lib/privileges";
import { UserAbility } from "@lib/types";
import { getTemplateWithAssociatedUsers } from "@lib/templates";
import { logEvent } from "@lib/auditLogs";

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

  const template = await getTemplateWithAssociatedUsers(invitation.templateId);

  if (!template) {
    throw new TemplateNotFoundError();
  }

  checkPrivileges(ability, [
    { action: "update", subject: { type: "FormRecord", object: template } },
  ]);

  // Delete the invitation
  await _deleteInvitation(invitationId);

  logEvent(
    ability.user.id,
    { type: "Form", id: invitation.templateId },
    "InvitationCancelled",
    `${ability.user.id} cancelled invitation for ${invitation.email}`
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
