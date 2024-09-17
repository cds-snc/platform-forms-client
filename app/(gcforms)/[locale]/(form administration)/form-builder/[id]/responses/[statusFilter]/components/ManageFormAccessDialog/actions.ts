"use server";

import { authCheckAndThrow } from "@lib/actions";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";

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
    return false;
  }

  // not sure?
  // checkPrivileges(ability, [
  //   { action: "update", subject: { type: "FormRecord", object: { users: template.users } } },
  //   { action: "update", subject: { type: "User", object: { id: ability.userID } } },
  // ]);

  if (template.users.some((user) => user.id === ability.userID)) {
    return true;
  }

  return false;
};

export const sendInvitation = async (emails: string[], templateId: string, message: string) => {
  if (await canManageUsersForForm(templateId)) {
    logMessage.info(
      `Sending invitation email to ${JSON.stringify(
        emails
      )} for form ${templateId} with message ${message}`
    );

    emails.forEach(async (email) => {
      try {
        await prisma.invitation.create({
          data: {
            email,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            template: {
              connect: {
                id: templateId,
              },
            },
          },
        });

        // send email
      } catch (e) {
        // handle
      }
    });
  }
};

export const removeUserFromForm = async (userId: string, formId: string) => {
  try {
    if (await canManageUsersForForm(formId)) {
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
