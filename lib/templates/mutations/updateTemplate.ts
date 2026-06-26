import { formCache } from "@lib/cache/formCache";
import { prisma, prismaErrors, Prisma } from "@gcforms/database";
import { FormRecord, FormProperties } from "@lib/types";
import { ClosedDetails } from "@gcforms/types";
import { checkForBetaComponentsAsync } from "@lib/validation/betaCheck";
import { logMessage } from "@lib/logger";
import { checkFlag, parseTemplate } from "../internal";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { InvalidFormConfigError, TemplateAlreadyPublishedError } from "../internal/errors";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";
import { isValidISODate } from "@lib/utils/date/isValidISODate";
import { UpdateTemplateCommand, UpdateTemplateAction } from "../types";
import { updateTemplate as updateTemplateVersioningEnabled } from "../versioning/mutations/updateTemplate";
import { isTemplateVersioningEnabled } from "../versioning/internal";
import { publishTemplate } from "./publishTemplate";
import { authorizeForCommand } from "./shared/authorizeForCommand";
import { logTemplateUpdateEvent } from "./shared/logTemplateUpdateEvent";

/**
 * Validate the form config for a template update command
 * @param formConfig
 * @param user
 */
export const validateFormConfig = async (formConfig: FormProperties, user: { email: string }) => {
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

export type UpdatePlan = {
  where: Prisma.TemplateWhereUniqueInput;
  data: Prisma.TemplateUpdateInput;
};

export const buildUpdateQuery = (command: UpdateTemplateCommand): UpdatePlan => {
  const basePlan = {
    where: {
      id: command.formId,
    },
  };

  switch (command.action) {
    case UpdateTemplateAction.Name:
      return {
        ...basePlan,
        data: {
          name: command.name,
        },
      };
    case UpdateTemplateAction.FormConfig:
      return {
        ...basePlan,
        where: {
          id: command.formId,
          isPublished: false,
        },
        data: {
          jsonConfig: command.formConfig as Prisma.JsonObject,
        },
      };
    case UpdateTemplateAction.ClosedData:
      if (command.closingDate !== null && !isValidISODate(String(command.closingDate))) {
        throw new Error(`Invalid ISO date ${command.closingDate}`);
      }

      let detailsData: ClosedDetails | null = null;

      if (command.closedDetails) {
        detailsData = {
          messageEn: command.closedDetails.messageEn || "",
          messageFr: command.closedDetails.messageFr || "",
        };
      }

      return {
        ...basePlan,
        data: {
          closingDate: command.closingDate,
          closedDetails:
            detailsData !== null ? (detailsData as Prisma.JsonObject) : Prisma.JsonNull,
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
        where: {
          id: command.formId,
          isPublished: false,
        },
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
          id: command.formId,
          isPublished: {
            not: command.isPublished,
          },
        },
        data: {
          isPublished: command.isPublished,
          publishReason: command.publishReason,
          publishFormType: command.publishFormType,
          publishDesc: command.publishDescription,
        },
      };
    case UpdateTemplateAction.SecurityAttribute:
      return {
        ...basePlan,
        where: {
          id: command.formId,
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

const executeTemplateUpdate = async (updatePlan: UpdatePlan, lastEditedByUserId: string) => {
  const updatedTemplate = await prisma.template
    .update({
      where: updatePlan.where,
      data: { ...updatePlan.data, lastEditedBy: { connect: { id: lastEditedByUserId } } },
      include: {
        deliveryOption: true,
        lastEditedBy: {
          select: {
            name: true,
          },
        },
      },
    })
    .catch((e) => prismaErrors(e, null));

  if (updatedTemplate === null) return null;

  return parseTemplate(updatedTemplate);
};

/**
 * Update a form template
 * @param template A Form Record containing updated information
 * @returns The updated form template or null if the record does not exist
 */
export async function updateTemplate(command: UpdateTemplateCommand): Promise<FormRecord | null> {
  if (command.action === UpdateTemplateAction.IsPublished) {
    return publishTemplate(command);
  }

  const templateVersioningEnabled = await isTemplateVersioningEnabled();
  if (templateVersioningEnabled) {
    return updateTemplateVersioningEnabled(command);
  }

  const { user } = await authorizeForCommand(command);

  const currentTemplate = await prisma.template.findUnique({
    where: {
      id: command.formId,
    },
    select: {
      name: true,
      jsonConfig: true,
    },
  });

  if ("formConfig" in command) {
    await validateFormConfig(command.formConfig, user);
  }

  const updateQuery = buildUpdateQuery(command);
  const updatedTemplate = await executeTemplateUpdate(updateQuery, user.id);

  if (updatedTemplate === null && command.action === UpdateTemplateAction.FormConfig) {
    throw new TemplateAlreadyPublishedError();
  }

  if (formCache.cacheAvailable) formCache.invalidate(command.formId);

  await logTemplateUpdateEvent({
    action: command.action,
    command,
    user,
    beforeContext: {
      name: currentTemplate?.name,
      jsonConfig: currentTemplate?.jsonConfig as FormProperties,
    },
  });

  return updatedTemplate;
}
