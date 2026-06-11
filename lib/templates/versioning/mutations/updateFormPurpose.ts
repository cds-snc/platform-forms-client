import { prisma, prismaErrors } from "@gcforms/database";
import { FormRecord } from "@lib/types";
import { authorization } from "@lib/privileges";
import {
  AuditLogAccessDeniedDetails,
  AuditLogEvent,
  AuditLogDetails,
  logEvent,
} from "@lib/auditLogs";
import { TemplateAlreadyPublishedError } from "../../internal/errors";
import { getBuilderVersion, parseTemplate, templateRecordInclude } from "../internal";

export async function updateFormPurpose(
  formID: string,
  formPurpose: string
): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetFormPurpose
    );
    throw e;
  });

  const currentTemplate = await prisma.template.findUnique({
    where: { id: formID },
    select: {
      isPublished: true,
      currentDraftVersionId: true,
    },
  });

  if (!currentTemplate) {
    return null;
  }

  if (currentTemplate.isPublished && !currentTemplate.currentDraftVersionId) {
    throw new TemplateAlreadyPublishedError();
  }

  const updatedTemplate = await prisma.template
    .update({
      where: { id: formID },
      data: { formPurpose },
      include: templateRecordInclude,
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeFormPurpose,
    AuditLogDetails.SetFormPurpose,
    { formPurpose }
  );

  return parseTemplate(updatedTemplate, {
    version: getBuilderVersion(updatedTemplate),
    isPublished: updatedTemplate.currentDraftVersion ? false : undefined,
  });
}
