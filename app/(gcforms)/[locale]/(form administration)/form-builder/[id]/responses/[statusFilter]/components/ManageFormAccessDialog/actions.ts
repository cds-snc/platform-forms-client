"use server";

import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { logMessage } from "@lib/logger";

// @TODO: security?
export const checkEmailExists = async (email: string) => {
  const user = await prisma.user
    .findUnique({ where: { email } })
    .catch((e) => prismaErrors(e, null));
  return !!user;
};

export const sendInvitation = async (email: string, templateId: string, message: string) => {
  // create invitation and send email using lib/invitations.ts
  logMessage.info(
    `Sending invitation email to ${email} for form ${templateId} with message ${message}`
  );
};
