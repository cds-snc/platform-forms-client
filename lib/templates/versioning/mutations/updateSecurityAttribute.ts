import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors } from "@gcforms/database";
import { authorization } from "@lib/privileges";
import {
  AuditLogAccessDeniedDetails,
  AuditLogDetails,
  AuditLogEvent,
  logEvent,
} from "@lib/auditLogs";
import { TemplateAlreadyPublishedError } from "../../internal/errors";
import { getBuilderVersion, parseTemplate, templateRecordInclude } from "../internal";

export const updateSecurityAttribute = async (formID: string, securityAttribute: string) => {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateSecurityAttribute
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
      data: { securityAttribute },
      include: templateRecordInclude,
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeSecurityAttribute,
    AuditLogDetails.ChangeSecurityAttribute,
    { securityAttribute: securityAttribute ?? "" }
  );

  return parseTemplate(updatedTemplate, {
    version: getBuilderVersion(updatedTemplate),
    isPublished: updatedTemplate.currentDraftVersion ? false : undefined,
  });
};
