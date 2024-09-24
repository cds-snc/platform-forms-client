"use server";

import { authCheckAndThrow } from "@lib/actions";
import { prisma } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { TemplateUser } from "./types";
import { cancelInvitation as cancelInvitationAction, inviteUserByEmail } from "@lib/invitations";
import { AccessControlError } from "@lib/privileges";
import { TemplateNotFoundError, UserAlreadyHasAccessError } from "@lib/invitations/exceptions";
import { getTemplateWithAssociatedUsers, removeAssignedUserFromTemplate } from "@lib/templates";

export const sendInvitation = async (emails: string[], templateId: string, message: string) => {
  const { ability } = await authCheckAndThrow();
  logMessage.info(
    `Sending invitation email to ${JSON.stringify(
      emails
    )} for form ${templateId} with message ${message}`
  );

  emails.forEach(async (email) => {
    try {
      inviteUserByEmail(ability, email, templateId, message);
    } catch (e) {
      if (e instanceof UserAlreadyHasAccessError) {
        // @TODO
      }
      if (e instanceof TemplateNotFoundError) {
        // @TODO
      }
      if (e instanceof AccessControlError) {
        // @TODO
      }
    }
  });
};

export const removeUserFromForm = async (userId: string, formId: string) => {
  const { ability } = await authCheckAndThrow();
  try {
    await removeAssignedUserFromTemplate(ability, formId, userId);
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

export const getTemplateUsers = async (formId: string) => {
  const { ability } = await authCheckAndThrow();

  const template = await getTemplateWithAssociatedUsers(ability, formId);

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
};

export const cancelInvitation = async (id: string) => {
  const { ability } = await authCheckAndThrow();
  cancelInvitationAction(ability, id);
};
