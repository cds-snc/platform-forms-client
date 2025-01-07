"use server";

import { authCheckAndThrow, AuthenticatedAction } from "@lib/actions";
import { prisma } from "@lib/integration/prismaConnector";
import { TemplateUser } from "./types";
import { AccessControlError } from "@lib/auth";
import {
  InvalidDomainError,
  MismatchedEmailDomainError,
  TemplateNotFoundError,
  UserAlreadyHasAccessError,
} from "@lib/invitations/exceptions";
import { getTemplateWithAssociatedUsers, removeAssignedUserFromTemplate } from "@lib/templates";
import { serverTranslation } from "@i18n";
import { logMessage } from "@lib/logger";
import { inviteUserByEmail } from "@lib/invitations/inviteUserByEmail";
import { cancelInvitation as cancelInvitationAction } from "@lib/invitations/cancelInvitation";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const sendInvitation = async (emails: string[], templateId: string, message: string) => {
  const { ability } = await authCheckAndThrow();
  const { t } = await serverTranslation("manage-form-access");

  const errors: string[] = [];

  const invites = emails.map(async (email) => {
    try {
      await inviteUserByEmail(ability, email, templateId, message);
    } catch (e) {
      if (e instanceof UserAlreadyHasAccessError) {
        errors.push(t("userAlreadyHasAccess", { email }));
      }
      if (e instanceof MismatchedEmailDomainError) {
        errors.push(t("emailDomainMismatch", { email }));
      }
      if (e instanceof InvalidDomainError) {
        errors.push(t("invalidEmail", { email }));
      }
      if (e instanceof TemplateNotFoundError) {
        errors.push(t("templateNotFound", { templateId }));
        throw e; // stop processing other emails
      }
      if (e instanceof AccessControlError) {
        errors.push(t("accessControlError"));
        throw e; // stop processing other emails
      }
      logMessage.error("Invitation failed", e);
      errors.push(t("invitationFailed", { email }));
    }
  });

  try {
    await Promise.allSettled(invites);
  } catch (e) {
    return {
      success: false,
      errors,
    };
  }

  if (errors.length) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
  };
};

export const removeUserFromForm = async (userId: string, formId: string) => {
  await authCheckAndThrow();
  try {
    await removeAssignedUserFromTemplate(formId, userId);
    return {
      success: true,
      message: "User removed",
    };
  } catch (e) {
    return {
      success: false,
      message: "Failed to remove user",
    };
  }
};

export const getTemplateUsers = AuthenticatedAction(async (_, formId: string) => {
  const template = await getTemplateWithAssociatedUsers(formId);

  if (!template) {
    throw new TemplateNotFoundError();
  }

  const invitations = await prisma.invitation.findMany({
    where: {
      templateId: formId,
    },
    select: {
      id: true,
      email: true,
      expires: true,
    },
  });

  const combinedUsers = [
    ...(template?.users.map((user) => ({ ...user })) || []),
    ...invitations.map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      expired: new Date(invitation.expires) < new Date(),
    })),
  ];

  return combinedUsers as TemplateUser[];
});

export const cancelInvitation = async (id: string) => {
  const { ability } = await authCheckAndThrow();
  cancelInvitationAction(ability, id);
};
