import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { DeliveryOption, FormProperties, FormRecord, SecurityAttribute } from "@lib/types";
import { authorization } from "../privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "../auditLogs";
import { logMessage } from "@lib/logger";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";
import { checkForBetaComponentsAsync } from "../validation/betaCheck";
import { NotificationsInterval } from "@gcforms/types";
import { checkFlag, parseTemplate } from "./shared";
import { InvalidFormConfigError } from "./errors";

// ******************************************
// Exportable Module Functions
// ******************************************

type CreateTemplateCommand = {
  userID: string;
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
 * Creates a Form Template record
 * @param config Form Template configuration
 * @returns Form Record or null if creation was not sucessfull.
 */
export async function createTemplate(command: CreateTemplateCommand): Promise<FormRecord | null> {
  const { user } = await authorization.canCreateForm().catch((e) => {
    logEvent(
      e.user.id,
      { type: "Form" },
      "AccessDenied",
      AuditLogAccessDeniedDetails.AccessDenied_AttemptToCreateForm
    );
    throw e;
  });

  await checkForBetaComponentsAsync(command.formConfig.elements, checkFlag);

  const validationResult = validateTemplate(command.formConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][createTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(command.formConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(command.formConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][createTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        command.formConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }

  const createdTemplate = await prisma.template
    .create({
      data: {
        jsonConfig: command.formConfig as Prisma.JsonObject,
        ...(command.name && {
          name: command.name,
        }),
        ...(command.deliveryOption && {
          deliveryOption: {
            create: {
              emailAddress: command.deliveryOption.emailAddress,
              emailSubjectEn: command.deliveryOption.emailSubjectEn,
              emailSubjectFr: command.deliveryOption.emailSubjectFr,
            },
          },
        }),
        ...(command.securityAttribute && {
          securityAttribute: command.securityAttribute as string,
        }),
        users: {
          connect: { id: command.userID },
        },
        ...(command.formPurpose && { formPurpose: command.formPurpose }),
        ...(command.notificationsInterval !== undefined && {
          notificationsInterval: command.notificationsInterval,
        }),
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

  if (createdTemplate === null) return null;

  logEvent(user.id, { type: "Form", id: createdTemplate?.id }, "CreateForm");

  return parseTemplate(createdTemplate);
}
