"use server";

import { serverTranslation } from "@i18n";
import { AuthenticatedAction } from "@lib/actions";
import { acceptInvitation } from "@lib/invitations/acceptInvitation";
import { declineInvitation } from "@lib/invitations/declineInvitation";
import {
  InvitationIsExpiredError,
  InvitationNotFoundError,
  UnableToAssignUserToTemplateError,
  UserNotFoundError,
} from "@lib/invitations/exceptions";

export const accept = AuthenticatedAction(async (id: string) => {
  const { t } = await serverTranslation("manage-form-access");

  try {
    await acceptInvitation(id);
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
});

export const decline = AuthenticatedAction(async (id: string) => {
  const { t } = await serverTranslation("manage-form-access");

  try {
    await declineInvitation(id);
  } catch (e) {
    if (e instanceof InvitationNotFoundError) {
      return { message: t("invitationNotFound") };
    }
  }
});
