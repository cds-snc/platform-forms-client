"use server";

import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { prisma } from "@lib/integration/prismaConnector";
import { acceptInvitation } from "@lib/invitations/acceptInvitation";
import { declineInvitation } from "@lib/invitations/declineInvitation";
import {
  InvitationIsExpiredError,
  InvitationNotFoundError,
  UnableToAssignUserToTemplateError,
  UserNotFoundError,
} from "@lib/invitations/exceptions";

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
  const { t } = await serverTranslation("manage-form-access");

  try {
    await acceptInvitation(ability, id);
    return true;
  } catch (e) {
    if (e instanceof InvitationNotFoundError) {
      return { message: t("invitationNotFound") };
    }
    if (e instanceof InvitationIsExpiredError) {
      return { message: t("invitationExpired") };
    }
    if (e instanceof UserNotFoundError) {
      return { message: t("userNotFound") };
    }
    if (e instanceof UnableToAssignUserToTemplateError) {
      return { message: t("error") };
    }
  }
};

export const decline = async (id: string) => {
  const { ability } = await authCheckAndThrow();
  const { t } = await serverTranslation("manage-form-access");

  try {
    await declineInvitation(ability, id);
  } catch (e) {
    if (e instanceof InvitationNotFoundError) {
      return { message: t("invitationNotFound") };
    }
  }
};
