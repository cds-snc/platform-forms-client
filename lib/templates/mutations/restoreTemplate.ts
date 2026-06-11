import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, AuditLogEvent, logEvent } from "@lib/auditLogs";
import { TemplateNotFoundError } from "../internal/errors";
import { parseTemplate } from "../internal";

/**
 * Restores a form template from the archived state.
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
export async function restoreTemplate(formID: string): Promise<FormRecord | null> {
  const { user } = await authorization.canRestoreForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUnarchiveForm
    );
    throw e;
  });

  // Check if the form is archived.
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
      ttl: { not: null },
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
      saveAndResume: true,
      notificationsInterval: true,
      ttl: true,
    },
  });

  if (!template) throw new TemplateNotFoundError();

  const templateMarkedToUnarchive = await prisma.template
    .update({
      where: {
        id: formID,
        ttl: { not: null },
      },
      data: {
        ttl: null,
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
        saveAndResume: true,
        notificationsInterval: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  // There was an error with Prisma, do not delete from Cache.
  if (templateMarkedToUnarchive === null) return templateMarkedToUnarchive;

  logEvent(user.id, { type: "Form", id: formID }, AuditLogEvent.UnarchiveForm);

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  return parseTemplate(templateMarkedToUnarchive);
}
