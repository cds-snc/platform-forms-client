import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord, FormProperties, DeliveryOption, SecurityAttribute } from "@lib/types";
import { ClosedDetails, NotificationsInterval } from "@gcforms/types";
import { authorization } from "@lib/privileges";
import {
  AuditLogAccessDeniedDetails,
  // AuditLogDetails,
  // AuditLogEvent,
  logEvent,
} from "@lib/auditLogs";
import { checkForBetaComponentsAsync } from "@lib/validation/betaCheck";
import { logMessage } from "@lib/logger";
import { checkFlag, parseTemplate } from "../internal";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { InvalidFormConfigError, TemplateAlreadyPublishedError } from "../internal/errors";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";
import { isValidISODate } from "@lib/utils/date/isValidISODate";

type UpdateTemplateCommand =
  | GeneralUpdateTemplateCommand
  | UpdateClosedDataCommand
  | UpdateFormBrandingCommand
  | UpdateFormPurposeCommand
  | UpdateFormSaveAndResumeCommand
  | UpdateIsPublishedCommand
  | UpdateSecurityAttributeCommand;

type BaseUpdateCommand = {
  formID: string;
  action:
    | "full"
    | "closedData"
    | "formBranding"
    | "formPurpose"
    | "formSaveAndResume"
    | "isPublished"
    | "securityAttribute";
};

// @TODO: revisit required attributes
type GeneralUpdateTemplateCommand = BaseUpdateCommand & {
  action: "full";
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

type UpdateClosedDataCommand = BaseUpdateCommand & {
  action: "closedData";
  closingDate: string | null;
  closedDetails?: ClosedDetails;
};

type UpdateFormBrandingCommand = BaseUpdateCommand & {
  action: "formBranding";
  formConfig: FormProperties;
};

type UpdateFormPurposeCommand = BaseUpdateCommand & {
  action: "formPurpose";
  formPurpose: string;
};

type UpdateFormSaveAndResumeCommand = BaseUpdateCommand & {
  action: "formSaveAndResume";
  saveAndResume: boolean;
};

type UpdateIsPublishedCommand = BaseUpdateCommand & {
  action: "isPublished";
  isPublished: boolean;
};

type UpdateSecurityAttributeCommand = BaseUpdateCommand & {
  action: "securityAttribute";
  securityAttribute: SecurityAttribute;
};

/**
 * Validate the form config for a template update command
 * @param formConfig
 * @param user
 */
const validateFormConfig = async (formConfig: FormProperties, user: { email: string }) => {
  await checkForBetaComponentsAsync(formConfig.elements, checkFlag).catch((e) => {
    logMessage.warn(`User ${user.email} tried to use beta form components without flags being set`);
    throw e;
  });

  const validationResult = validateTemplate(formConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][updateTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(formConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(formConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][updateTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        formConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }
};

type AuthorizationResult = Awaited<ReturnType<typeof authorization.canEditForm>>;

const authorizeForCommand = async (
  command: UpdateTemplateCommand
): Promise<AuthorizationResult> => {
  switch (command.action) {
    case "full":
    case "closedData":
    case "formBranding":
    case "formPurpose":
    case "formSaveAndResume":
    case "securityAttribute":
      return authorization.canEditForm(command.formID).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formID },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateForm
        );
        throw e;
      });
    case "isPublished":
      return authorization.canPublishForm(command.formID).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formID },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToPublishForm
        );
        throw e;
      });
    default:
      throw new Error(`Unknown command action: ${JSON.stringify(command)}`);
  }
};

type UpdatePlan = {
  where: Prisma.TemplateWhereUniqueInput;
  data: Prisma.TemplateUpdateInput;
  include: Prisma.TemplateInclude;
};

const buildUpdatePlan = (command: UpdateTemplateCommand): UpdatePlan => {
  const basePlan = {
    where: {
      id: command.formID,
    },
    include: {
      deliveryOption: true,
      lastEditedBy: {
        select: {
          name: true,
        },
      },
    },
  };

  switch (command.action) {
    case "full":
      return {
        ...basePlan,
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
      };
    case "closedData":
      if (command.closingDate !== null && !isValidISODate(String(command.closingDate))) {
        throw new Error(`Invalid ISO date ${command.closingDate}`);
      }
      return {
        ...basePlan,
        data: {
          closingDate: command.closingDate,
          ...(command.closedDetails && {
            closedDetails:
              command.closedDetails !== null
                ? (command.closedDetails as Prisma.JsonObject)
                : Prisma.JsonNull,
          }),
        },
      };
    case "formBranding":
      return {
        ...basePlan,
        data: {
          jsonConfig: command.formConfig as Prisma.JsonObject,
        },
      };
    case "formPurpose":
      return {
        ...basePlan,
        data: {
          formPurpose: command.formPurpose,
        },
      };
    case "formSaveAndResume":
      return {
        ...basePlan,
        data: {
          saveAndResume: command.saveAndResume,
        },
      };
    case "isPublished":
      return {
        ...basePlan,
        where: {
          id: command.formID,
          isPublished: false,
        },
        data: {
          isPublished: command.isPublished,
        },
      };
    case "securityAttribute":
      return {
        ...basePlan,
        where: {
          id: command.formID,
          isPublished: false,
        },
        data: {
          securityAttribute: command.securityAttribute as string,
        },
      };
    default:
      throw new Error(`Unknown command action: ${JSON.stringify(command)}`);
  }
};

const executeTemplateUpdate = async (updatePlan: UpdatePlan) => {
  const updatedTemplate = await prisma.template
    .update({
      where: updatePlan.where,
      data: updatePlan.data,
      include: updatePlan.include,
    })
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2025") {
          // @TODO ?
          throw new TemplateAlreadyPublishedError();
        }
      }
      return prismaErrors(e, null);
    });

  if (updatedTemplate === null) return null;

  // if (formCache.cacheAvailable) formCache.invalidate(updatePlan.where.id);

  return parseTemplate(updatedTemplate);
};

/**
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
export async function updateTemplate(command: UpdateTemplateCommand): Promise<FormRecord | null> {
  const { user } = await authorizeForCommand(command);

  // const currentTemplate = await prisma.template.findUnique({
  //   where: {
  //     id: command.formID,
  //   },
  //   select: {
  //     name: true,
  //     deliveryOption: true,
  //     securityAttribute: true,
  //   },
  // });

  if ("formConfig" in command) {
    await validateFormConfig(command.formConfig, user);
  }

  const updatePlan = buildUpdatePlan(command);
  const updatedTemplate = await executeTemplateUpdate(updatePlan);

  if (formCache.cacheAvailable) formCache.invalidate(command.formID);

  return updatedTemplate;

  // Log the audit events
  // command.name !== undefined &&
  //   (currentTemplate?.name ?? "") !== command.name &&
  //   logEvent(
  //     user.id,
  //     { type: "Form", id: command.formID },
  //     AuditLogEvent.ChangeFormName,
  //     AuditLogDetails.UpdatedFormName,
  //     { newFormName: command.name ?? "" }
  //   );
  // command.deliveryOption &&
  //   command.deliveryOption !== currentTemplate?.deliveryOption &&
  //   logEvent(
  //     user.id,
  //     { type: "Form", id: command.formID },
  //     "ChangeDeliveryOption",
  //     AuditLogDetails.ChangeDeliveryOption,
  //     {
  //       deliveryOption: Object.keys(command.deliveryOption)
  //         .map((key) => `${key}: ${command.deliveryOption && command.deliveryOption[key]}`)
  //         .join(", "),
  //     }
  //   );
  // command.securityAttribute &&
  //   command.securityAttribute !== currentTemplate?.securityAttribute &&
  //   logEvent(
  //     user.id,
  //     { type: "Form", id: command.formID },
  //     AuditLogEvent.ChangeSecurityAttribute,
  //     AuditLogDetails.ChangeSecurityAttribute,
  //     { securityAttribute: command.securityAttribute ?? "" }
  //   );
  // logEvent(
  //   user.id,
  //   { type: "Form", id: command.formID },
  //   "UpdateForm",
  //   AuditLogDetails.FormContentUpdated
  // );

  // return parseTemplate(updatedTemplate);
}
