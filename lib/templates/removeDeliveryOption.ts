import { prisma } from "@gcforms/database";

import { authorization } from "../privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, logEvent } from "../auditLogs";
import { TemplateAlreadyPublishedError, TemplateNotFoundError } from "./errors";

/**
 * Remove DeliveryOption from template. Form responses will be sent to the Vault.
 * @param formID The unique identifier of the form you want to modify
 * @returns void
 */
export async function removeDeliveryOption(formID: string): Promise<void> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetDeliveryToVault
    );
    throw e;
  });

  // Don't change delivery option if the form is published
  const template = await prisma.template.findFirstOrThrow({
    where: {
      id: formID,
    },
    select: {
      isPublished: true,
    },
  });

  if (!template) throw new TemplateNotFoundError();

  if (template.isPublished) throw new TemplateAlreadyPublishedError();

  await prisma.deliveryOption.deleteMany({
    where: {
      templateId: formID,
    },
  });

  logEvent(
    user.id,
    { type: "Form", id: formID },
    "ChangeDeliveryOption",
    AuditLogDetails.SetDeliveryToVault
  );
}
