import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { authorization } from "@lib/privileges";
import {
  AuditLogAccessDeniedDetails,
  AuditLogEvent,
  AuditLogDetails,
  logEvent,
} from "@lib/auditLogs";
import { TemplateAlreadyPublishedError } from "../internal/errors";
import { parseTemplate } from "../internal";
import { isTemplateVersioningEnabled } from "../versioning/internal";
import { updateFormPurpose as updateFormPurposeVersioningEnabled } from "../versioning/mutations/updateFormPurpose";

export async function updateFormPurpose(
  formID: string,
  formPurpose: string
): Promise<FormRecord | null> {
  if (await isTemplateVersioningEnabled()) {
    return updateFormPurposeVersioningEnabled(formID, formPurpose);
  }

  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetFormPurpose
    );
    throw e;
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
        isPublished: false,
      },
      data: {
        formPurpose: formPurpose,
        lastEditedByUserId: user.id,
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
        lastEditedBy: {
          select: {
            name: true,
          },
        },
      },
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          throw new TemplateAlreadyPublishedError();
        }
      }
      return prismaErrors(e, null);
    });

  if (updatedTemplate === null) return updatedTemplate;

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeFormPurpose,
    AuditLogDetails.SetFormPurpose,
    { formPurpose: formPurpose }
  );

  return parseTemplate(updatedTemplate);
}
