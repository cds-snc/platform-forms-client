"use server";

import { authCheckAndThrow } from "@lib/actions";
import { prisma } from "@lib/integration/prismaConnector";
import { acceptInvitation, declineInvitation } from "@lib/invitations";
import { InvitationIsExpiredError, InvitationNotFoundError } from "@lib/invitations/exceptions";
import { logMessage } from "@lib/logger";

export const retrieveInvitations = async () => {
  const { session } = await authCheckAndThrow();

  const invitations = await prisma.invitation.findMany({
    where: {
      email: session.user.email,
      expires: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      email: true,
      expires: true,
      templateId: true,
    },
  });

  return invitations;
};

export const accept = async (id: string) => {
  const { ability } = await authCheckAndThrow();

  try {
    await acceptInvitation(ability, id);
    // @TODO: refresh forms?
  } catch (e) {
    if (e instanceof InvitationNotFoundError) {
      logMessage.error("Invitation not found");
      // Handle error
    }
    if (e instanceof InvitationIsExpiredError) {
      logMessage.error("Invitation is expired");
      // Handle error
    }
  }
};

export const decline = async (id: string) => {
  const { ability } = await authCheckAndThrow();

  try {
    await declineInvitation(ability, id);
  } catch (e) {
    if (e instanceof InvitationNotFoundError) {
      logMessage.error("Invitation not found");
      // Handle error
    }
  }
};
