import { AuditLogDetails, AuditLogEvent, logEvent } from "@lib/auditLogs";
import isEqual from "lodash.isequal";
import {
  UpdateClosedDataCommand,
  UpdateFormBrandingCommand,
  UpdateFormConfigCommand,
  UpdateFormPurposeCommand,
  UpdateFormSaveAndResumeCommand,
  UpdateIsPublishedCommand,
  UpdateNameCommand,
  UpdateSecurityAttributeCommand,
  UpdateTemplateAction,
  UpdateTemplateCommand,
} from "../../types";

import { FormProperties } from "@lib/types";

export type UpdateAuditEvent = {
  action: UpdateTemplateAction;
  command: UpdateTemplateCommand;
  user: { id: string; email: string };
  beforeContext?: {
    name?: string;
    jsonConfig?: FormProperties;
  };
};

export const logTemplateUpdateEvent = async (event: UpdateAuditEvent) => {
  switch (event.action) {
    case UpdateTemplateAction.Name:
      const nameCommand = event.command as UpdateNameCommand;
      nameCommand.name !== undefined &&
        (event.beforeContext?.name ?? "") !== nameCommand.name &&
        logEvent(
          event.user.id,
          { type: "Form", id: nameCommand.formId },
          AuditLogEvent.ChangeFormName,
          AuditLogDetails.UpdatedFormName,
          { newFormName: nameCommand.name ?? "" }
        );
      break;
    case UpdateTemplateAction.FormConfig:
      const formConfigCommand = event.command as UpdateFormConfigCommand;
      !isEqual(event.beforeContext?.jsonConfig ?? {}, formConfigCommand.formConfig) &&
        logEvent(
          event.user.id,
          { type: "Form", id: formConfigCommand.formId },
          "UpdateForm",
          AuditLogDetails.FormContentUpdated
        );
      break;
    case UpdateTemplateAction.ClosedData:
      const closedCommand = event.command as UpdateClosedDataCommand;

      if (closedCommand.closingDate) {
        const date = new Date(closedCommand.closingDate);
        logEvent(
          event.user.id,
          { type: "Form", id: closedCommand.formId },
          "UpdateForm",
          AuditLogDetails.UpdateClosingDate,
          { closingDate: date.toLocaleDateString("en-CA") }
        );
      } else {
        logEvent(
          event.user.id,
          { type: "Form", id: event.command.formId },
          "UpdateForm",
          AuditLogDetails.RemoveClosingDate
        );
      }
      break;
    case UpdateTemplateAction.FormBranding:
      const brandingCommand = event.command as UpdateFormBrandingCommand;
      const brandName = brandingCommand.formConfig.brand?.name ?? "gc";
      logEvent(
        event.user.id,
        { type: "Form", id: brandingCommand.formId },
        AuditLogEvent.UpdateFormBranding,
        AuditLogDetails.UpdateFormBranding,
        { brand: brandName }
      );
      break;
    case UpdateTemplateAction.FormPurpose:
      const purposeCommand = event.command as UpdateFormPurposeCommand;
      logEvent(
        event.user.id,
        { type: "Form", id: purposeCommand.formId },
        AuditLogEvent.ChangeFormPurpose,
        AuditLogDetails.SetFormPurpose,
        { formPurpose: purposeCommand.formPurpose }
      );
      break;
    case UpdateTemplateAction.FormSaveAndResume:
      const saveAndResumeCommand = event.command as UpdateFormSaveAndResumeCommand;
      logEvent(
        event.user.id,
        { type: "Form", id: saveAndResumeCommand.formId },
        AuditLogEvent.ChangeFormSaveAndResume,
        AuditLogDetails.SetSaveAndResume,
        { saveAndResume: saveAndResumeCommand.saveAndResume ? "On" : "Off" }
      );
      break;
    case UpdateTemplateAction.IsPublished:
      const publishCommand = event.command as UpdateIsPublishedCommand;
      logEvent(event.user.id, { type: "Form", id: publishCommand.formId }, "PublishForm");
      break;
    case UpdateTemplateAction.SecurityAttribute:
      const securityCommand = event.command as UpdateSecurityAttributeCommand;
      logEvent(
        event.user.id,
        { type: "Form", id: securityCommand.formId },
        AuditLogEvent.ChangeSecurityAttribute,
        AuditLogDetails.ChangeSecurityAttribute,
        { securityAttribute: securityCommand.securityAttribute ?? "" }
      );
  }
};
