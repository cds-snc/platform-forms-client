import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { PublicFormRecord } from "@lib/types";
import { mapTemplateToPublicFormRecord, parseTemplate } from "../internal";
import { logMessage } from "@lib/logger";
import { isTemplateVersioningEnabled } from "../versioning/internal";
import { getPublicTemplateByID as getPublicTemplateByIDVersioningEnabled } from "@lib/templates/versioning/queries/getPublicTemplateByID";

/**
 * Get a form template by ID (only includes public information but does not require any permission)
 * @param formID ID of form template
 * @returns PublicFormRecord
 */
export async function getPublicTemplateByID(formID: string): Promise<PublicFormRecord | null> {
  if (await isTemplateVersioningEnabled()) {
    return getPublicTemplateByIDVersioningEnabled(formID);
  }

  try {
    if (formCache.cacheAvailable) {
      // This value will always be the latest if it exists because
      // the cache is invalidated on change of a template
      const cachedValue = await formCache.check(formID);
      if (cachedValue) {
        return cachedValue;
      }
    }

    const template = await prisma.template
      .findUnique({
        where: {
          id: formID,
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          name: true,
          jsonConfig: true,
          isPublished: true,
          deliveryOption: true,
          securityAttribute: true,
          formPurpose: true,
          publishReason: true,
          publishFormType: true,
          publishDesc: true,
          closingDate: true,
          closedDetails: true,
          saveAndResume: true,
          ttl: true,
          notificationsInterval: true,
        },
      })
      .catch((e) => prismaErrors(e, null));

    // Short circuit the public record filtering if no form record is found or the form is marked as deleted (ttl != null)
    if (!template || template.ttl) return null;

    const parsedTemplate = parseTemplate(template);
    const publicFormRecord = mapTemplateToPublicFormRecord(parsedTemplate);

    if (formCache.cacheAvailable) formCache.set(formID, publicFormRecord);

    return publicFormRecord;
  } catch (e) {
    logMessage.error(e);
    return null;
  }
}
