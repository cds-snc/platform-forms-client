import { formCache } from "../cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord } from "@lib/types";

import { authorization } from "../privileges";
import { AuditLogAccessDeniedDetails, AuditLogEvent, logEvent } from "../auditLogs";
import { unprocessedSubmissions } from "../vault";
import { deleteKey } from "../serviceAccount";
import { TemplateHasUnprocessedSubmissions, TemplateNotFoundError } from "./internal/errors";
import { parseTemplate } from "./shared";

/**
 * Deletes a form template. The template will stay in the database for 30 days in an archived state until a lambda function deletes it from the database.
 * @param formID ID of the form template
 * @returns A boolean status if operation is sucessful
 */
export async function deleteTemplate(formID: string): Promise<FormRecord | null> {
  const { user } = await authorization.canDeleteForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToDeleteForm
    );
    throw e;
  });

  // Check if the form is draft or not.
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
    },
    select: {
      isPublished: true,
    },
  });

  if (!template) throw new TemplateNotFoundError();

  // Only check submissions if the form is published.
  if (template.isPublished) {
    // Ignore cache (last boolean parameter) because we want to make sure we did not get new submissions while in the flow of deleting a form
    const numOfUnprocessedSubmissions = await unprocessedSubmissions(formID, true);
    if (numOfUnprocessedSubmissions) throw new TemplateHasUnprocessedSubmissions();
  }

  // Check and delete any API keys from IDP
  await deleteKey(formID);

  const dateIn30Days = new Date(Date.now() + 2592000000); // 30 days = 60 (seconds) * 60 (minutes) * 24 (hours) * 30 (days) * 1000 (to ms)
  const templateMarkedAsDeleted = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        ttl: dateIn30Days,
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
  if (templateMarkedAsDeleted === null) return templateMarkedAsDeleted;

  logEvent(user.id, { type: "Form", id: formID }, AuditLogEvent.DeleteForm);

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  return parseTemplate(templateMarkedAsDeleted);
}
