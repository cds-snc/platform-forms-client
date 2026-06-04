import { formCache } from "../../cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { ClosedDetails } from "@lib/types";
import { dateHasPast } from "@lib/utils";

export const getTemplateClosureState = async (formId: string) => {
  try {
    let isPastClosingDate = false;
    let template = null;

    // The form cache stores the public template information
    if (formCache.cacheAvailable) {
      // This value will always be the latest if it exists because
      // the cache is invalidated on change of a template
      const cachedValue = await formCache.check(formId);
      if (cachedValue) {
        template = cachedValue;
      }
    }

    // If the template is not in the cache, we need to fetch it from the database
    if (!template) {
      template = await prisma.template
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
    }
    // If it's not in the cache and in the DB then it doesn't exist
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
