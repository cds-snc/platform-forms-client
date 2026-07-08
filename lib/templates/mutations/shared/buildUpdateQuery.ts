import { Prisma } from "@gcforms/database";
import { ClosedDetails } from "@gcforms/types";
import { isValidISODate } from "@lib/utils/date/isValidISODate";
import { UpdateTemplateCommand, UpdateTemplateAction } from "../../types";

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
