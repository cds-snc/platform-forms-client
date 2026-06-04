import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord } from "@lib/types";

import { authorization } from "../privileges";
import {
  AuditLogAccessDeniedDetails,
  AuditLogDetails,
  AuditLogEvent,
  logEvent,
} from "../auditLogs";
import { parseTemplate } from "./shared";

export async function updateFormSaveAndResume(
  formID: string,
  saveAndResume: boolean
): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetSaveAndResume
    );
    throw e;
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        saveAndResume: saveAndResume ?? false,
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
        publishDesc: true,
        publishFormType: true,
        publishReason: true,
        saveAndResume: true,
        notificationsInterval: true,
      },
    })
    .catch((e) => {
      return prismaErrors(e, null);
    });

  if (updatedTemplate === null) return updatedTemplate;

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeFormSaveAndResume,
    AuditLogDetails.SetSaveAndResume,
    { saveAndResume: saveAndResume ? "On" : "Off" }
  );

  return parseTemplate(updatedTemplate);
}
