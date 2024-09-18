"use server";

import { authCheckAndThrow } from "@lib/actions";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { TemplateUser } from "./types";
import { inviteUserByEmail } from "@lib/invitations";
import { checkPrivilegesAsBoolean } from "@lib/privileges";

const _canManageUsersForForm = async (formId: string) => {
  const { ability } = await authCheckAndThrow();
  const template = await prisma.template.findFirst({
    where: {
      id: formId,
    },
    include: {
      users: true,
    },
  });

  if (!template) {
    return false;
  }

  // @TODO: check?
  if (
    checkPrivilegesAsBoolean(ability, [
      { action: "update", subject: { type: "FormRecord", object: { users: template.users } } },
      { action: "update", subject: { type: "User", object: { id: ability.userID } } },
    ])
  ) {
    return true;
  }

  // if (template.users.some((user) => user.id === ability.userID)) {
  //   return true;
  // }

  return false;
};

export const sendInvitation = async (emails: string[], templateId: string, message: string) => {
  const { ability } = await authCheckAndThrow();
  logMessage.info(
    `Sending invitation email to ${JSON.stringify(
      emails
    )} for form ${templateId} with message ${message}`
  );

  emails.forEach(async (email) => {
    // @TODO: error handling
    inviteUserByEmail(ability, email, templateId, message);
  });
};

export const removeUserFromForm = async (userId: string, formId: string) => {
  try {
    if (await _canManageUsersForForm(formId)) {
      await prisma.template
        .update({
          where: {
            id: formId,
          },
          data: {
            users: {
              disconnect: {
                id: userId,
              },
            },
          },
        })
        .catch((e) => prismaErrors(e, null));

      return {
        success: true,
        message: "User removed",
      };
    }
  } catch (e) {
    return {
      success: false,
      message: "Failed to remove user",
    };
  }
};

export const getTemplateUsers = async (formId: string) => {
  await _canManageUsersForForm(formId);

  const templateWithUsers = await prisma.template
    .findUnique({
      where: {
        id: formId,
      },
      select: {
        users: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

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
    ...(templateWithUsers?.users.map((user) => ({ ...user })) || []),
    ...invitations.map((invitation) => ({
      id: invitation.id,
      email: invitation.email,
      expired: new Date(invitation.expires) < new Date(),
    })),
  ];

  return combinedUsers as TemplateUser[];
};
