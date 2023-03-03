import { SQSClient, GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import { logMessage } from "./logger";

export enum AuditLogEvent {
  // Form Events
  CreateForm = "CreateForm",
  ReadForm = "ReadForm",
  UpdateForm = "UpdateForm",
  DeleteForm = "DeleteForm",
  PublishForm = "PublishForm",
  ChangeDeliveryOption = "ChangeDeliveryOption",
  GrantFormAccess = "GrantFormAccess",
  RevokeFormAccess = "RevokeFormAccess",
  // Form Response Events
  DownloadResponse = "DownloadResponse",
  ConfirmResponse = "ConfirmResponse",
  IdentifyProblemResponse = "IdentifyProblemResponse",
  ListResponses = "ListResponses",
  // User Events
  UserRegistration = "UserRegistration",
  UserSignIn = "UserSignIn",
  UserSignOut = "UserSignOut",
  UserPasswordReset = "UserPasswordReset",
  UserTooManyFailedAttempts = "UserTooManyFailedAttempts",
  GrantPrivilege = "GrantPrivilege",
  RevokePrivilege = "RevokePrivilege",
  // Application events
  EnableFlag = "EnableFlag",
  DisableFlag = "DisableFlag",
  ListAllFlags = "ListAllFlags",
  AccessDenied = "AccessDenied",
}
export type AuditLogEventStrings = keyof typeof AuditLogEvent;

export enum AuditSubjectType {
  User = "User",
  Form = "Form",
  Response = "Response",
  DeliveryOption = "DeliveryOption",
  Privilege = "Privilege",
  Flag = "Flag",
}

let sqsClient: SQSClient | null = null;
let queueUrl: string | null = null;

const getQueueURL = async (client: SQSClient) => {
  const data = await client.send(
    new GetQueueUrlCommand({
      QueueName: "audit_log_queue",
    })
  );
  return data.QueueUrl ?? null;
};

const getSQSClient = async () => {
  if (!sqsClient) {
    sqsClient = new SQSClient({
      region: process.env.AWS_REGION ?? "ca-central-1",
      endpoint: process.env.LOCAL_AWS_ENDPOINT,
    });
  }
  if (!queueUrl) {
    queueUrl = process.env.AUDIT_LOG_QUEUE_URL ?? (await getQueueURL(sqsClient));
  }
  return sqsClient;
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
    subject: `${subject.type}#${subject.id}`,
    description,
  });
  try {
    const client = await getSQSClient();
    if (!queueUrl || !sqsClient) throw new Error("Audit Log Queue not connected");
    await client.send(
      new SendMessageCommand({
        MessageBody: auditLog,
        QueueUrl: queueUrl,
      })
    );
  } catch (e) {
    // Only log the error in Production environment.
    // Development may be running without LocalStack setup
    if (process.env.NODE_ENV === "development") return logMessage.debug(auditLog);

    logMessage.error("ERROR with Audit Logging");
    logMessage.error(e as Error);
    // Ensure the audit event is not lost by sending to console
    logMessage.warn(`AuditLog:${auditLog}`);
  }
};
