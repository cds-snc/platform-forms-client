import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormProperties } from "@lib/types";
import { authorization } from "@lib/privileges";
import {
  AuditLogAccessDeniedDetails,
  AuditLogDetails,
  AuditLogEvent,
  logEvent,
} from "@lib/auditLogs";
import { logMessage } from "@lib/logger";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";
import { InvalidFormConfigError, TemplateAlreadyPublishedError } from "../../internal/errors";
import {
  getBuilderVersion,
  getTemplateJsonConfigMirrorData,
  parseTemplate,
  templateRecordInclude,
} from "../internal";

export const updateFormBranding = async (formId: string, jsonConfig: FormProperties) => {
  const { user } = await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateFormJson
    );
    throw e;
  });

  const validationResult = validateTemplate(jsonConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][updateTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(jsonConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(jsonConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][updateTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        jsonConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }

  const currentTemplate = await prisma.template.findUnique({
    where: { id: formId },
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

  const updatedTemplate = currentTemplate.currentDraftVersionId
    ? await prisma
        .$transaction(async (tx) => {
          await tx.templateVersion.update({
            where: {
              id: currentTemplate.currentDraftVersionId as string,
            },
            data: {
              jsonConfig: jsonConfig as Prisma.JsonObject,
            },
          });

          return tx.template.update({
            where: {
              id: formId,
            },
            data: {
              ...(currentTemplate.isPublished
                ? {}
                : getTemplateJsonConfigMirrorData(jsonConfig as Prisma.JsonObject)),
            },
            include: templateRecordInclude,
          });
        })
        .catch((e) => prismaErrors(e, null))
    : await prisma.template
        .update({
          where: {
            id: formId,
          },
          data: getTemplateJsonConfigMirrorData(jsonConfig as Prisma.JsonObject),
          include: templateRecordInclude,
        })
        .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formId);

  const brandName = jsonConfig.brand?.name ?? "gc";
  logEvent(
    user.id,
    { type: "Form", id: formId },
    AuditLogEvent.UpdateFormBranding,
    AuditLogDetails.UpdateFormBranding,
    { brand: brandName }
  );

  return parseTemplate(updatedTemplate, {
    version: getBuilderVersion(updatedTemplate),
    isPublished: updatedTemplate.currentDraftVersion ? false : undefined,
  });
};
