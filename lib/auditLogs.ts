import { GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import { logMessage } from "./logger";
import { sqsClient } from "./integration/awsServicesConnector";

export enum AuditLogEvent {
  // Form Events
  CreateForm = "CreateForm",
  ReadForm = "ReadForm",
  UpdateForm = "UpdateForm",
  DeleteForm = "DeleteForm",
  PublishForm = "PublishForm",
  ChangeFormName = "ChangeFormName",
  ChangeDeliveryOption = "ChangeDeliveryOption",
  ChangeSecurityAttribute = "ChangeSecurityAttribute",
  GrantFormAccess = "GrantFormAccess",
  RevokeFormAccess = "RevokeFormAccess",
  // Form Response Events
  DownloadResponse = "DownloadResponse",
  ConfirmResponse = "ConfirmResponse",
  IdentifyProblemResponse = "IdentifyProblemResponse",
  ListResponses = "ListResponses",
  DeleteResponses = "DeleteResponses",
  RetrieveResponses = "RetrieveResponses",
  // User Events
  UserRegistration = "UserRegistration",
  UserSignIn = "UserSignIn",
  UserSignOut = "UserSignOut",
  UserActivated = "UserActivated",
  UserDeactivated = "UserDeactivated",
  UserPasswordReset = "UserPasswordReset",
  UserTooManyFailedAttempts = "UserTooManyFailedAttempts",
  GrantPrivilege = "GrantPrivilege",
  RevokePrivilege = "RevokePrivilege",
  // Application events
  EnableFlag = "EnableFlag",
  DisableFlag = "DisableFlag",
  ListAllFlags = "ListAllFlags",
  ListAllSettings = "ListAllSettings",
  ListSetting = "ListSetting",
  ChangeSetting = "ChangeSetting",
  CreateSetting = "CreateSetting",
  DeleteSetting = "DeleteSetting",
  AccessDenied = "AccessDenied",
}
export type AuditLogEventStrings = keyof typeof AuditLogEvent;

export enum AuditSubjectType {
  User = "User",
  Form = "Form",
  Response = "Response",
  DeliveryOption = "DeliveryOption",
  SecurityAttribute = "SecurityAttribute",
  Privilege = "Privilege",
  Flag = "Flag",
  Setting = "Setting",
}

let queueUrlRef: string | null = null;

const getQueueURL = async () => {
  if (!queueUrlRef) {
    if (process.env.AUDIT_LOG_QUEUE_URL) {
      queueUrlRef = process.env.AUDIT_LOG_QUEUE_URL;
    } else {
      const data = await sqsClient.send(
        new GetQueueUrlCommand({
          QueueName: "audit_log_queue",
        })
      );
      queueUrlRef = data.QueueUrl ?? null;
    }
  }

  return queueUrlRef;
};

export const logEvent = async (
  userID: string,
  subject: { type: keyof typeof AuditSubjectType; id?: string },
  event: AuditLogEventStrings,
  description?: string
): Promise<void> => {
  const auditLog = JSON.stringify({
    userID,
    event,
    timestamp: Date.now(),
    subject,
    description,
  });
  try {
    const queueUrl = await getQueueURL();
    if (!queueUrl) throw new Error("Audit Log Queue not connected");
    await sqsClient.send(
      new SendMessageCommand({
        MessageBody: auditLog,
        QueueUrl: queueUrl,
      })
    );
  } catch (e) {
    // Only log the error in Production environment.
    // Development may be running without LocalStack setup
    if (process.env.NODE_ENV === "development" || process.env.APP_ENV === "test")
      return logMessage.info(`AuditLog:${auditLog}`);

    logMessage.error("ERROR with Audit Logging");
    logMessage.error(e as Error);
    // Ensure the audit event is not lost by sending to console
    logMessage.warn(`AuditLog:${auditLog}`);
  }
};
