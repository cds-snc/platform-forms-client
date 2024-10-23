"use server";

import { serverTranslation } from "@i18n";
import { authCheckAndThrow } from "@lib/actions";
import { acceptInvitation } from "@lib/invitations/acceptInvitation";
import { declineInvitation } from "@lib/invitations/declineInvitation";
import {
  InvitationIsExpiredError,
  InvitationNotFoundError,
  UnableToAssignUserToTemplateError,
  UserNotFoundError,
} from "@lib/invitations/exceptions";

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
