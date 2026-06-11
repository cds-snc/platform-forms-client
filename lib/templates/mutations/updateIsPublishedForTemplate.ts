import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "@lib/auditLogs";
import { deleteDraftFormResponses } from "@lib/vault";
import { TemplateAlreadyPublishedError } from "../internal/errors";
import { getFullTemplateByID } from "@lib/templates/queries/getFullTemplateByID";
import { parseTemplate } from "../internal";
import { isTemplateVersioningEnabled } from "../versioning/internal";
import { updateIsPublishedForTemplate as updateIsPublishedForTemplateVersioningEnabled } from "@lib/templates/versioning/mutations/updateIsPublishedForTemplate";

/**
 * Update `isPublished` value for a specific form.
 */
export async function updateIsPublishedForTemplate(
  formID: string,
  isPublished: boolean,
  publishReason: string,
  publishFormType: string,
  publishDescription: string
): Promise<FormRecord | null> {
  if (await isTemplateVersioningEnabled()) {
    return updateIsPublishedForTemplateVersioningEnabled(
      formID,
      isPublished,
      publishReason,
      publishFormType,
      publishDescription
    );
  }

  // Alias the isPublished value to newPublishStatus for clarity within the function
  const newPublishStatus = isPublished;

  const { user } = await authorization.canPublishForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToPublishForm
    );
    throw e;
  });

  // Delete all form responses created during draft mode
  if (newPublishStatus && process.env.APP_ENV !== "test") {
    try {
      await deleteDraftFormResponses(formID);
    } catch (e) {
      if (e instanceof TemplateAlreadyPublishedError) {
        // Already published, so we can just return the full template
        return getFullTemplateByID(formID, false);
      }

      throw e;
    }
  }

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
        isPublished: {
          not: newPublishStatus, // Only update if the current publish status is different from the new one,
        },
      },
      data: {
        isPublished: newPublishStatus,
        publishReason: publishReason,
        publishFormType: publishFormType,
        publishDesc: publishDescription,
      },
      include: {
        deliveryOption: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  logEvent(user.id, { type: "Form", id: formID }, "PublishForm");

  return parseTemplate(updatedTemplate);
}
