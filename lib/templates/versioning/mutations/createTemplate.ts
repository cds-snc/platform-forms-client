import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { DeliveryOption, FormProperties, FormRecord, SecurityAttribute } from "@lib/types";
import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "@lib/auditLogs";
import { logMessage } from "@lib/logger";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";
import { checkForBetaComponentsAsync } from "@lib/validation/betaCheck";
import { NotificationsInterval } from "@gcforms/types";
import { InvalidFormConfigError } from "../../internal/errors";
import { TEMPLATE_VERSION_STATUS } from "../internal/types";
import { templateRecordInclude } from "../internal";
import { checkFlag } from "../../internal";
import { parseTemplate } from "../internal";

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

const getTemplateJsonConfigCreateData = (jsonConfig: Prisma.JsonObject) => {
  // Creates still seed Template.jsonConfig until the schema contract step removes the column.
  return { jsonConfig };
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

  const createdTemplate = await prisma
    .$transaction(async (tx) => {
      const template = await tx.template.create({
        data: {
          ...getTemplateJsonConfigCreateData(command.formConfig as Prisma.JsonObject),
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
        },
      });

      const draftVersion = await tx.templateVersion.create({
        data: {
          templateId: template.id,
          versionNumber: 1,
          status: TEMPLATE_VERSION_STATUS.DRAFT,
          jsonConfig: command.formConfig as Prisma.JsonObject,
          createdByUserId: user.id,
        },
        select: {
          id: true,
        },
      });

      return tx.template.update({
        where: {
          id: template.id,
        },
        data: {
          currentDraftVersionId: draftVersion.id,
        },
        include: templateRecordInclude,
      });
    })
    .catch((e) => prismaErrors(e, null));

  if (createdTemplate === null) return null;

  logEvent(user.id, { type: "Form", id: createdTemplate?.id }, "CreateForm");

  return parseTemplate(createdTemplate, {
    version: createdTemplate.currentDraftVersion,
    isPublished: false,
  });
}
