"use server";

import { authCheckAndThrow } from "@lib/actions";
import { prisma } from "@lib/integration/prismaConnector";

export const retrieveInvitations = async () => {
  const { session } = await authCheckAndThrow();

  const invitations = await prisma.invitation.findMany({
    where: {
      email: session.user.email,
      expires: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      email: true,
      expires: true,
      templateId: true,
    },
  });

  return invitations;
};

export const acceptInvitation = async (id: string) => {
  console.log(id);
};

export const declineInvitation = async (id: string) => {
  console.log(id);
};
