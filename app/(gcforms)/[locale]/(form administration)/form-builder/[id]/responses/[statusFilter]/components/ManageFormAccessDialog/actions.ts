"use server";

import { authCheckAndThrow } from "@lib/actions";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";
import { checkPrivileges } from "@lib/privileges";
import { removeAssignedUserForTemplate } from "@lib/templates";

export const sendInvitation = async (email: string, templateId: string, message: string) => {
  // @TODO: create invitation and send email using lib/invitations.ts
  logMessage.info(
    `Sending invitation email to ${email} for form ${templateId} with message ${message}`
  );
};

export const removeUserFromForm = async (userId: string, formId: string) => {
  const { ability } = await authCheckAndThrow();
  return removeAssignedUserForTemplate(ability, formId, userId);
};

export const getTemplateUsers = async (formId: string) => {
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
    return;
  }

  // User should be an existing owner of the form
  // @TODO: is this correct? same as removeAssignedUserForTemplate/updateAssignedUsersForTemplate
  checkPrivileges(ability, [
    { action: "update", subject: { type: "FormRecord", object: { users: template.users } } },
    { action: "update", subject: { type: "User", object: { id: ability.userID } } },
  ]);

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
