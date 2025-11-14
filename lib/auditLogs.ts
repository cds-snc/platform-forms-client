import {
  BatchGetCommand,
  BatchGetCommandOutput,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { delay } from "@lib/utils/retryability";
import { GetQueueUrlCommand, SendMessageCommand } from "@aws-sdk/client-sqs";
import { logMessage } from "./logger";
import { sqsClient, dynamoDBDocumentClient } from "./integration/awsServicesConnector";
import { getUsersEmails } from "@lib/users";

export enum AuditLogEvent {
  // Form Events
  CreateForm = "CreateForm",
  ReadForm = "ReadForm",
  UpdateForm = "UpdateForm",
  DeleteForm = "DeleteForm",
  UnarchiveForm = "UnarchiveForm",
  PublishForm = "PublishForm",
  ChangeFormName = "ChangeFormName",
  ChangeDeliveryOption = "ChangeDeliveryOption",
  ChangeFormPurpose = "ChangeFormPurpose",
  ChangeFormSaveAndResume = "ChangeFormSaveAndResume",
  ChangeSecurityAttribute = "ChangeSecurityAttribute",
  GrantFormAccess = "GrantFormAccess",
  RevokeFormAccess = "RevokeFormAccess",
  UpdateNotificationsInterval = "UpdateNotificationsInterval",
  UpdateNotificationsUserSetting = "UpdateNotificationsUserSetting",
  UpdateFormJsonConfig = "updateFormJsonConfig",
  // Invitations
  InvitationCreated = "InvitationCreated",
  InvitationAccepted = "InvitationAccepted",
  InvitationDeclined = "InvitationDeclined",
  InvitationCancelled = "InvitationCancelled",
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
  CreateSecurityAnswers = "CreateSecurityAnswers",
  ChangeSecurityAnswers = "ChangeSecurityAnswers",
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
  // API Management
  CreateAPIKey = "CreateAPIKey",
  DeleteAPIKey = "DeleteAPIKey",
  RefreshAPIKey = "RefreshAPIKey",
  IncreaseThrottlingRate = "IncreaseThrottlingRate",
  ResetThrottlingRate = "ResetThrottlingRate",
  // Audi Log events
  AuditLogsRead = "AuditLogsRead",
}
export type AuditLogEventStrings = keyof typeof AuditLogEvent;

export enum AuditSubjectType {
  User = "User",
  ServiceAccount = "ServiceAccount",
  Form = "Form",
  Response = "Response",
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
  userId: string,
  subject: { type: keyof typeof AuditSubjectType; id?: string },
  event: AuditLogEventStrings,
  description?: string
): Promise<void> => {
  const auditLog = JSON.stringify({
    userId,
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
    if (process.env.NODE_ENV === "development" || process.env.APP_ENV === "test")
      return logMessage.info(`AuditLog:${auditLog}`);

    logMessage.error("ERROR with Audit Logging");
    logMessage.error(e as Error);
    // Ensure the audit event is not lost by sending to console
    logMessage.warn(`AuditLog:${auditLog}`);
  }
};

export const retrieveAuditLogs = async (keys: Array<Record<string, string>>) => {
  let retries = 0;
  const maxRetries = 3;
  const auditLogs: Array<{
    UserID: string;
    Event: string;
    TimeStamp: number;
    Description: string;
    Subject: string;
  }> = [];

  const batchRequest = new BatchGetCommand({
    RequestItems: {
      AuditLogs: {
        Keys: keys.map((event) => ({
          UserID: event.UserID,
          "Event#SubjectID#TimeStamp": event["Event#SubjectID#TimeStamp"],
        })),
      },
    },
  });

  await dynamoDBDocumentClient.send(batchRequest).then(async (data: BatchGetCommandOutput) => {
    auditLogs.push(
      ...(data?.Responses?.AuditLogs?.map((item: Record<string, string | number>) => ({
        UserID: item.UserID as string,
        Event: item.Event as string,
        TimeStamp: item.TimeStamp as number,
        Description: item.Description as string,
        Subject: item.Subject as string,
      })) ?? [])
    );

    if (data.UnprocessedKeys?.AuditLogs) {
      while (retries < maxRetries) {
        // eslint-disable-next-line no-await-in-loop -- Intentional retry logic with delay
        await delay(200); // Wait for 200ms second before retrying
        const retryRequest = new BatchGetCommand({
          RequestItems: {
            AuditLogs: {
              Keys: data.UnprocessedKeys.AuditLogs.Keys,
            },
          },
        });
        const retryResponse: BatchGetCommandOutput =
          // eslint-disable-next-line no-await-in-loop -- Intentional retry logic
          await dynamoDBDocumentClient.send(retryRequest);
        auditLogs.push(
          ...(retryResponse.Responses?.AuditLogs.map((item: Record<string, string | number>) => ({
            UserID: item.UserID as string,
            Event: item.Event as string,
            TimeStamp: item.TimeStamp as number,
            Description: item.Description as string,
            Subject: item.Subject as string,
          })) ?? [])
        );
        if (!retryResponse.UnprocessedKeys?.AuditLogs) {
          break; // Exit the loop if there are no more unprocessed keys
        }
        retries++;
      }
    }
  });
  return auditLogs;
};

export const retrieveEvents = async (
  query: QueryCommandInput,
  options?: {
    filter?: string[];
    mapUserEmail?: boolean;
  }
) => {
  const request = new QueryCommand(query);

  const response = (await dynamoDBDocumentClient.send(request)) as QueryCommandOutput;
  const { Items: eventsIndex, Count: eventsIndexCount } = response;

  if (eventsIndexCount === 0 || eventsIndex === undefined) {
    return [];
  }
  let eventItems = await retrieveAuditLogs(eventsIndex);

  if (options?.filter) {
    eventItems = eventItems.filter((event) => !options.filter?.includes(event.Event));
  }

  if (options?.mapUserEmail) {
    const userIds = Array.from(new Set(eventItems.map((event) => event.UserID)));
    const formId = eventItems[0]?.Subject.split("#")[1];
    const users = await getUsersEmails(formId, userIds);

    eventItems.forEach((event) => {
      event.UserID = users.find((user) => user.id === event.UserID)?.email || "Unknown User";
    });
  }

  return eventItems
    .map((record) => {
      return {
        userId: record.UserID,
        event: record.Event,
        timestamp: record.TimeStamp,
        description: record.Description,
        subject: record.Subject,
      };
    })
    .sort((a, b) => {
      return b.timestamp - a.timestamp;
    });
};
