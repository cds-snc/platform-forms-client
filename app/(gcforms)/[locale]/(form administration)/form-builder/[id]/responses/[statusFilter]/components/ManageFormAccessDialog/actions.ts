"use server";

import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";

export const sendInvitation = async (email: string, templateId: string, message: string) => {
  // @TODO: create invitation and send email using lib/invitations.ts
  logMessage.info(
    `Sending invitation email to ${email} for form ${templateId} with message ${message}`
  );
};

export const removeUserFromForm = async (userId: string, formId: string) => {
  // @TODO: remove user from form using lib/templates.ts
  logMessage.info(`Removing user ${userId} from form ${formId}`);
};

// @TODO: check privileges?
export const getTemplateUsers = async (formId: string) => {
  const template = await prisma.template
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

  return template?.users;
};
