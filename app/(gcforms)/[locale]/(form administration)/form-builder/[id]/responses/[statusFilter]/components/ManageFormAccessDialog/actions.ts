"use server";

import { prisma, prismaErrors } from "@lib/integration/prismaConnector";

export const checkEmailExists = async (email: string) => {
  const user = await prisma.user
    .findUnique({ where: { email } })
    .catch((e) => prismaErrors(e, null));
  return !!user;
};
