"use server";

import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { ClosedDetails } from "@lib/types";
import { dateHasPast } from "@lib/utils";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const checkIfClosed = async (formId: string) => {
  try {
    let isPastClosingDate = false;

    // Note these are the only fields we need from the template
    // They are public fields so no auth check is needed see _unprotectedGetTemplateByID
    const template = await prisma.template
      .findUnique({
        where: {
          id: formId,
        },
        select: {
          closingDate: true,
          closedDetails: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    if (!template) {
      throw new Error("Template not found");
    }

    if (template.closingDate) {
      isPastClosingDate = dateHasPast(Date.parse(String(template.closingDate)));
    }

    return {
      isPastClosingDate,
      closedDetails: template.closedDetails as ClosedDetails,
    };
  } catch (e) {
    return null;
  }
};
