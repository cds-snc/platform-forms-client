import { formCache } from "./cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormProperties, ClosedDetails } from "@lib/types";

import { authorization } from "./privileges";
import { AuditLogAccessDeniedDetails, AuditLogDetails, AuditLogEvent, logEvent } from "./auditLogs";
import { logMessage } from "@lib/logger";
import { isValidISODate } from "./utils/date/isValidISODate";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { dateHasPast } from "@lib/utils";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";

export const updateClosedData = async (
  formID: string,
  closingDate: string | null,
  details?: ClosedDetails
) => {
  const { user } = await authorization.canEditForm(formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateClosingDate
    );
    throw e;
  });

  let detailsData: ClosedDetails | null = null;

  if (closingDate !== null && !isValidISODate(String(closingDate))) {
    throw new Error(`Invalid ISO date ${closingDate}`);
  }

  // Add the closed details if they exist
  if (details) {
    detailsData = {};
    detailsData.messageEn = details?.messageEn || "";
    detailsData.messageFr = details?.messageFr || "";
  }

  await prisma.template
    .update({
      where: {
        id: formID,
      },
      data: {
        closingDate,
        closedDetails: detailsData !== null ? (detailsData as Prisma.JsonObject) : Prisma.JsonNull,
      },
      select: {
        id: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  if (closingDate) {
    const date = new Date(closingDate);

    logEvent(
      user.id,
      { type: "Form", id: formID },
      "UpdateForm",
      AuditLogDetails.UpdateClosingDate,
      {
        closingDate: date.toLocaleDateString("en-CA"),
      }
    );
  } else {
    logEvent(
      user.id,
      { type: "Form", id: formID },
      "UpdateForm",
      AuditLogDetails.RemoveClosingDate
    );
  }

  return { formID, closingDate };
};

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

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: formID,
        isPublished: false,
      },
      data: { securityAttribute },
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

  if (updatedTemplate === null) return updatedTemplate;

  if (formCache.cacheAvailable) formCache.invalidate(formID);

  logEvent(
    user.id,
    { type: "Form", id: formID },
    AuditLogEvent.ChangeSecurityAttribute,
    AuditLogDetails.ChangeSecurityAttribute,
    { securityAttribute: securityAttribute ?? "" }
  );

  return _parseTemplate(updatedTemplate);
};

export const checkIfClosed = async (formId: string) => {
  try {
    let isPastClosingDate = false;
    let template = null;

    // The form cache stores the public template information
    if (formCache.cacheAvailable) {
      // This value will always be the latest if it exists because
      // the cache is invalidated on change of a template
      const cachedValue = await formCache.check(formId);
      if (cachedValue) {
        template = cachedValue;
      }
    }

    // If the template is not in the cache, we need to fetch it from the database
    if (!template) {
      template = await prisma.template
        .findUnique({
          where: {
            id: formId,
          },
          select: {
            closingDate: true,
            closedDetails: true,
          },
        })
        .catch((e) => prismaErrors(e, null));
    }
    // If it's not in the cache and in the DB then it doesn't exist
    if (!template) {
      throw new Error("Template not found");
    }

    if (template.closingDate) {
      isPastClosingDate = dateHasPast(Date.parse(String(template.closingDate)));
    }

    return {
      isPastClosingDate,
      closedDetails: template.closedDetails as ClosedDetails,
    };
  } catch (e) {
    return null;
  }
};

export const getFormJSONConfig = async (formId: string) => {
  await authorization.canEditForm(formId).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: formId },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToGetFormJson
    );
    throw e;
  });

  const result = await prisma.template
    .findUnique({
      where: { id: formId },
      select: { jsonConfig: true },
    })
    .catch((e) => prismaErrors(e, null));

  if (!result) {
    throw new Error(`Template not found when getting jsonConfig with formId ${formId}`);
  }

  let jsonConfig: FormProperties;
  const raw = result.jsonConfig;

  if (typeof raw === "string") {
    // Only parse if (unexpectedly) stored as a string
    jsonConfig = JSON.parse(raw) as FormProperties;
  } else {
    jsonConfig = raw as FormProperties;
  }

  return jsonConfig;
};

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
      data: { jsonConfig: jsonConfig as Prisma.JsonObject },
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

  return _parseTemplate(updatedTemplate);
};
