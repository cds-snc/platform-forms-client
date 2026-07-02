import { authorization } from "@lib/privileges";
import { AuditLogAccessDeniedDetails, logEvent } from "@lib/auditLogs";
import { UpdateTemplateAction, UpdateTemplateCommand } from "../../types";

type AuthorizationResult = Awaited<ReturnType<typeof authorization.canEditForm>>;

export const authorizeForCommand = async (
  command: UpdateTemplateCommand
): Promise<AuthorizationResult> => {
  switch (command.action) {
    case UpdateTemplateAction.Name:
      return authorization.canEditForm(command.formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateForm
        );
        throw e;
      });
    case UpdateTemplateAction.FormConfig:
      return authorization.canEditForm(command.formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateFormJson
        );
        throw e;
      });
    case UpdateTemplateAction.ClosedData:
      return authorization.canEditForm(command.formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateClosingDate
        );
        throw e;
      });
    case UpdateTemplateAction.FormBranding:
      return authorization.canEditForm(command.formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateFormJson
        );
        throw e;
      });
    case UpdateTemplateAction.FormPurpose:
      return authorization.canEditForm(command.formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetFormPurpose
        );
        throw e;
      });
    case UpdateTemplateAction.FormSaveAndResume:
      return authorization.canEditForm(command.formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToSetSaveAndResume
        );
        throw e;
      });
    case UpdateTemplateAction.SecurityAttribute:
      return authorization.canEditForm(command.formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToUpdateSecurityAttribute
        );
        throw e;
      });
    case UpdateTemplateAction.IsPublished:
      return authorization.canPublishForm(command.formId).catch((e) => {
        logEvent(
          e.user.id,
          { type: "Form", id: command.formId },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptToPublishForm
        );
        throw e;
      });
    default:
      throw new Error(`Unknown command action: ${JSON.stringify(command)}`);
  }
};
