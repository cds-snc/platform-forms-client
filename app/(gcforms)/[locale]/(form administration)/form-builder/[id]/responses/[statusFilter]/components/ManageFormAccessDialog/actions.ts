"use server";

import { authCheckAndThrow } from "@lib/actions";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { checkPrivileges } from "@lib/privileges";

const canManageUsersForForm = async (formId: string) => {
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
    // @TODO: custom exception or?
    throw new Error(`Template ${formId} not found`);
  }

  checkPrivileges(ability, [
    { action: "update", subject: { type: "FormRecord", object: { users: template.users } } },
    { action: "update", subject: { type: "User", object: { id: ability.userID } } },
  ]);
};

export const sendInvitation = async (email: string, templateId: string, message: string) => {
  await canManageUsersForForm(templateId);

  // @TODO:
  // - create invitation
  // - send email
  logMessage.info(
    `Sending invitation email to ${email} for form ${templateId} with message ${message}`
  );
};

export const removeUserFromForm = async (userId: string, formId: string) => {
  try {
    await canManageUsersForForm(formId);

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

    return true;
  } catch (e) {
    return false;
  }
};

export const getTemplateUsers = async (formId: string) => {
  await canManageUsersForForm(formId);

  const templateWithUsers = await prisma.template
    .findUnique({
      where: {
        id: formId,
      },
      select: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  return templateWithUsers?.users;
};
