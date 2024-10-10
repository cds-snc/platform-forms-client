"use server";

import { authCheckAndThrow } from "@lib/actions";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { ClosedDetails } from "@lib/types";

export const getClosedDetails = async (formId: string) => {
  try {
    const { ability, session } = await authCheckAndThrow();

    if (!ability || !session || formId === "0000") {
      throw new Error("Unauthorized");
    }

    const template = await prisma.template
      .findUnique({
        where: {
          id: formId,
        },
        select: {
          closedDetails: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (!template) {
      throw new Error("Template not found");
    }

    return template.closedDetails as ClosedDetails;
  } catch (e) {
    return null;
  }
};
