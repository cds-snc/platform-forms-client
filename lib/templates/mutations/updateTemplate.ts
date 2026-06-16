import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord, FormProperties, SecurityAttribute } from "@lib/types";
import { ClosedDetails } from "@gcforms/types";
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

export const UpdateTemplateAction = {
  General: "general",
  ClosedData: "closedData",
  FormBranding: "formBranding",
  FormPurpose: "formPurpose",
  FormSaveAndResume: "formSaveAndResume",
  IsPublished: "isPublished",
  SecurityAttribute: "securityAttribute",
} as const;

export type UpdateTemplateAction = (typeof UpdateTemplateAction)[keyof typeof UpdateTemplateAction];

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
  action: UpdateTemplateAction;
};

type GeneralUpdateTemplateCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.General;
  formConfig: FormProperties;
  name?: string;
};

type UpdateClosedDataCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.ClosedData;
  closingDate: string | null;
  closedDetails?: ClosedDetails;
};

type UpdateFormBrandingCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.FormBranding;
  formConfig: FormProperties;
};

type UpdateFormPurposeCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.FormPurpose;
  formPurpose: string;
};

type UpdateFormSaveAndResumeCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.FormSaveAndResume;
  saveAndResume: boolean;
};

type UpdateIsPublishedCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.IsPublished;
  isPublished: boolean;
};

type UpdateSecurityAttributeCommand = BaseUpdateCommand & {
  action: typeof UpdateTemplateAction.SecurityAttribute;
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
    case UpdateTemplateAction.General:
    case UpdateTemplateAction.ClosedData:
    case UpdateTemplateAction.FormBranding:
    case UpdateTemplateAction.FormPurpose:
    case UpdateTemplateAction.FormSaveAndResume:
    case UpdateTemplateAction.SecurityAttribute:
      return authorization.canEditForm(command.formID).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formID },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateForm
        );
        throw e;
      });
    case UpdateTemplateAction.IsPublished:
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
    case UpdateTemplateAction.General:
      return {
        ...basePlan,
        data: {
          jsonConfig: command.formConfig as Prisma.JsonObject,
          name: command.name,
        },
      };
    case UpdateTemplateAction.ClosedData:
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
    case UpdateTemplateAction.FormBranding:
      return {
        ...basePlan,
        data: {
          jsonConfig: command.formConfig as Prisma.JsonObject,
        },
      };
    case UpdateTemplateAction.FormPurpose:
      return {
        ...basePlan,
        data: {
          formPurpose: command.formPurpose,
        },
      };
    case UpdateTemplateAction.FormSaveAndResume:
      return {
        ...basePlan,
        data: {
          saveAndResume: command.saveAndResume,
        },
      };
    case UpdateTemplateAction.IsPublished:
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
    case UpdateTemplateAction.SecurityAttribute:
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
