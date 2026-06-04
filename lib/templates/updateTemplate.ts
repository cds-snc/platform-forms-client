import { formCache } from "../cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord, FormProperties, DeliveryOption, SecurityAttribute } from "@lib/types";
import { NotificationsInterval } from "@gcforms/types";
import { authorization } from "../privileges";
import {
  AuditLogAccessDeniedDetails,
  AuditLogDetails,
  AuditLogEvent,
  logEvent,
} from "../auditLogs";
import { checkForBetaComponentsAsync } from "../validation/betaCheck";
import { logMessage } from "@lib/logger";
import { checkFlag, parseTemplate } from "./shared";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { InvalidFormConfigError, TemplateAlreadyPublishedError } from "./internal/errors";
import { validateTemplateSize } from "../utils/validateTemplateSize";

type UpdateTemplateCommand = {
  formID: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: string;
  publishReason?: string;
  publishFormType?: string;
  publishDesc?: string;
  notificationsInterval?: NotificationsInterval;
};

/**
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
export async function updateTemplate(command: UpdateTemplateCommand): Promise<FormRecord | null> {
  const { user } = await authorization.canEditForm(command.formID).catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form", id: command.formID },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateForm
    );
    throw e;
  });

  await checkForBetaComponentsAsync(command.formConfig.elements, checkFlag).catch((e) => {
    logMessage.warn(`User ${user.email} tried to use beta form components without flags being set`);
    throw e;
  });

  const validationResult = validateTemplate(command.formConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][updateTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(command.formConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(command.formConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][updateTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        command.formConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }

  const currentTemplate = await prisma.template.findUnique({
    where: {
      id: command.formID,
    },
    select: {
      name: true,
      deliveryOption: true,
      securityAttribute: true,
    },
  });

  const updatedTemplate = await prisma.template
    .update({
      where: {
        id: command.formID,
        isPublished: false,
      },
      data: {
        jsonConfig: command.formConfig as Prisma.JsonObject,
        name: command.name,
        ...(command.deliveryOption && {
          deliveryOption: {
            upsert: {
              create: {
                emailAddress: command.deliveryOption.emailAddress,
                emailSubjectEn: command.deliveryOption.emailSubjectEn,
                emailSubjectFr: command.deliveryOption.emailSubjectFr,
              },
              update: {
                emailAddress: command.deliveryOption.emailAddress,
                emailSubjectEn: command.deliveryOption.emailSubjectEn,
                emailSubjectFr: command.deliveryOption.emailSubjectFr,
              },
            },
          },
        }),
        ...(command.securityAttribute && {
          securityAttribute: command.securityAttribute as string,
        }),
        ...(command.formPurpose && { formPurpose: command.formPurpose }),
        ...(command.notificationsInterval !== undefined && {
          notificationsInterval: command.notificationsInterval as NotificationsInterval,
        }),
      },
      include: {
        deliveryOption: true,
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) throw new TemplateAlreadyPublishedError();

  if (formCache.cacheAvailable) formCache.invalidate(command.formID);

  // Log the audit events
  command.name !== undefined &&
    (currentTemplate?.name ?? "") !== command.name &&
    logEvent(
      user.id,
      { type: "Form", id: command.formID },
      AuditLogEvent.ChangeFormName,
      AuditLogDetails.UpdatedFormName,
      { newFormName: command.name ?? "" }
    );
  command.deliveryOption &&
    command.deliveryOption !== currentTemplate?.deliveryOption &&
    logEvent(
      user.id,
      { type: "Form", id: command.formID },
      "ChangeDeliveryOption",
      AuditLogDetails.ChangeDeliveryOption,
      {
        deliveryOption: Object.keys(command.deliveryOption)
          .map((key) => `${key}: ${command.deliveryOption && command.deliveryOption[key]}`)
          .join(", "),
      }
    );
  command.securityAttribute &&
    command.securityAttribute !== currentTemplate?.securityAttribute &&
    logEvent(
      user.id,
      { type: "Form", id: command.formID },
      AuditLogEvent.ChangeSecurityAttribute,
      AuditLogDetails.ChangeSecurityAttribute,
      { securityAttribute: command.securityAttribute ?? "" }
    );
  logEvent(
    user.id,
    { type: "Form", id: command.formID },
    "UpdateForm",
    AuditLogDetails.FormContentUpdated
  );

  return parseTemplate(updatedTemplate);
}
