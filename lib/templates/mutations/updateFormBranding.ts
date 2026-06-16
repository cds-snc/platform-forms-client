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
import { InvalidFormConfigError } from "../internal/errors";
import { parseTemplate } from "../internal";

/**
 * WARNING:
 * Avoid using this function for any update that would modify the structure of the form
 * e.g. groups, layouts, elements, etc.
 * Doing so would cause an error in the infra pipeline when processing submissions.
 */
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

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formId,
      },
      data: {
        jsonConfig: jsonConfig as Prisma.JsonObject,
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
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        saveAndResume: true,
        notificationsInterval: true,
        lastEditedBy: {
          select: {
            name: true,
          },
        },
      },
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

  return parseTemplate(updatedTemplate);
};
