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

export enum AuditLogDetails {
  UserAuditLogsRead = "User ${callingUserId} read audit logs for user ${userId}",
  FormAuditLogsRead = "User ${callingUserId} read audit logs for form ${formId}",
  GetAuditSubject = "Attempted to get events for Subject ${subject}",
  DownloadedFormResponses = "Downloaded form response in ${format} for submission ID ${item.id}",
  IncreasedThrottling = "User ${userId} increased throttling rate on form ${formId} for ${weeks} week(s)",
  PermanentIncreasedThrottling = "User ${userId} permanently increased throttling rate on form ${formId}",
  ResetThrottling = "User ${userId} reset throttling rate on form ${formId}",
  DeclinedInvitation = "${userId} has declined an invitation",
  AcceptedInvitation = "${userId} has accepted an invitation",
  AccessGranted = "Access granted to ${grantedUserId}",
  CancelInvitation = "User ${userId} cancelled invitation for ${invitationEmail}",
  UserInvited = "User ${userEmail} invited ${invitationEmail}",
  CognitoUserIdentifier = "Cognito user unique identifier (sub): ${userId}",
  UpdatedNotificationSettings = "`User :${userId} updated notifications setting on form ${formId} to ${enabled}",
  ConfirmedResponsesForForm = "Confirmed responses for form ${formId}",
  DeletedDraftResponsesForForm = "Deleted draft responses for form ${formId}",
  RetreiveSelectedFormResponses = "Retrieve selected responses for form ${formID} with ID ${submissionID}",
  ListAllResponsesForForm = "List all responses ${status} for form ${formID}",
  UserActiveStatusUpdate = "User ${email} (userID: ${userID}) was ${active} by user ${privilegedUserEmail} (userID: ${privilegedUserId})",
  AccessedAllSystemForms = "Accessed Forms: All System Forms",
  ClonedForm = "Cloned Form",
  UpdateClosingDate = "Updated closing date for Form",
  RetrieveFormUsers = "Retrieved users associated with Form",
  RevokeFormAccess = "Access revoked for ${userId}",
  SetDeliveryToVault = "Delivery Option set to the Vault",
  SetSaveAndResume = "Form save and resume set to ${saveAndResume}",
  SetFormPurpose = "Form Purpose set to ${formPurpose}",
  FormContentUpdated = "Form content updated",
  UpdatedFormName = "Updated form name to ${newFormName}",
  GrantFormAccess = "Access granted to ${userID}",
  AccessedForms = "Accessed Forms: ${formList}",
  ChangeDeliveryOption = "Changed delivery option to ${deliveryOption}",
  ChangeSecurityAttribute = "Changed security attribute to ${securityAttribute}",
  AccessGrantedTo = "Access granted to ${userList}",
  AccessRevokedFor = "Access revoked for ${userList}",
  //API Keys
  GeneratedNewApiKey = "User :${userId} generated a new API key for service account ${serviceAccountId}",
  CreatedNewApiKey = "User :${userId} created API key for service account ${serviceAccountId}",
  DeletedServiceAccount = "User :${userId} deleted service account ${serviceAccountID} for template ${templateId}",
  // App Settings
  UpdatedAppSetting = "Updated setting with ${settingData}",
  CreatedAppSetting = "Created setting with ${settingData}",
  DeletedAppSetting = "Deleted setting with internalId: ${internalId}",
  //Privilege Events
  GrantedPrivilege = "Granted privilege ${privilege} to user ${email} (userID: ${userId}) by ${userEmail} (userID: ${abilityUserId})",
  RevokedPrivilege = "Revoked privilege ${privilege} from user ${email} (userID: ${userId}) by ${userEmail} (userID: ${abilityUserId})",
}

export enum AuditLogAccessDeniedDetails {
  AccessDenied_AttemptedToReadFormObject = "Attemped to read form object",
  AccessDenied_AttemptToCreateForm = "Attempted to create a Form",
  AccessDenied_AttemptToDeleteForm = "Attempted to delete Form",
  AccessDenied_AttemptToUnarchiveForm = "Attempted to unarchive form",
  AccessDenied_AttemptToPublishForm = "Attempted to publish form",
  AccessDenied_AttemptToUpdateForm = "Attempted to update Form",
  AccessDenied_AttemptToUpdateFormJson = "Attempted to update form jsonConfig",
  AccessDenied_AttemptToGetFormJson = "Attempted to get form jsonConfig",
  AccessDenied_AttemptToUpdateSecurityAttribute = "Attempted to update security attribute",
  AccessDenied_AttemptToUpdateClosingDate = "Attempted to update closing date for Form",
  AccessDenied_AttemptToCloneFormNoEdit = "Attempted to clone Form - missing edit permission",
  AccessDenied_AttemptToCloneFormNoCreate = "Attempted to clone Form - missing create permission",
  AccessDenied_AttemptToSetDeliveryToVault = "Attempted to set Delivery Option to the Vault",
  AccessDenied_AttemptToSetAssignedUsers = "Attempted to update assigned users for form",
  AccessDenied_AttemptToRemoveAssignedUser = "Attempted to remove assigned user for form",
  AccessDenied_AttemptToListAssignedUsers = "Attempted to retrieve users associated with Form",
  AccessDenied_AttemptToSetSaveAndResume = "Attempted to set save and resume",
  AccessDenied_AttemptToSetFormPurpose = "Attempted to set form purpose",
  AccessDenied_AttempttoAccessAllSystemForms = "Attempted to access all System Forms",
  AccessDenied_IdentifyProblemResponse = "Attempted to identify problem response without form ownership",
  AccessDenied_IdentifiedProblemResponse = "Identified problem response for form ${formId}",
  AccessDenied_AttemptToModifyPrivilege = "Attempted to modify privilege on user ${userId}",
  AccessDenied_CancelInvitation = "User ${userId} does not have permission to cancel invitation",
  AccessDenied_NoInvitePermission = "User ${userId} does not have permission to invite user",
  AccessDenied_AttemptedToGetUserEmails = "Attempted to get users emails",
  AccessDenied_AttemptedToListUsers = "Attempted to list users",
  AccessDenied_AttemptedToGetUserById = "Attempted to get user by id ${id}",
  AccessDenied_AttemptedToUpdateUserActiveStatus = "Attempted to update user ${targetUserId} status",
  AccessDenied_AttemptToAccessUnprocessedSubmissions = "Attempted to get unprocessed submissions for user ${userId}",
  AccessDenied_AttemptToCheckResponseStatus = "Attempted to check response status for form ${formID}",
  AccessDenied_AttemptToListResponses = "Attempted to list responses for form ${formID}",
  AccessDenied_AttemptToRetrieveResponse = "Attempted to retrieve response for form ${formID}",
  AccessDenied_AttemptToDeleteResponses = "Attempted to delete responses for form ${formID}",
  AccessDenied_AttemptToConfirmResponses = "Attempted to confirm response for form ${formID}",
  AccessDenied_AttemptToAddNoteToUser = "Attempted to add note to user ${userId}",
  PasswordAttemptsExceeded = "Password attempts exceeded for ${sanitizedUsername}",
  MFAAttemptsExceeded = "2FA attempts exceeded for ${sanitizedEmail}",
  AccessDenied_AttemptToCreateSecurityAnswers = "Attempted to create security answers",
  AccessDenied_AttemptToUpdateSecurityAnswers = "Attempted to update security answers",
  // Feature Flag Auth
  AccessDenied_AttemptToEnableFlag = "Attempted to enable flag ${flagKey}",
  AccessDenied_AttemptToDisableFlag = "Attempted to disable flag ${flagKey}",
  // App Setting Auth
  AccessDenied_AttemptToListAllSettings = "Attempted to list all Settings",
  AccessDenied_AttemptToListFullAppSettings = "Attempted to list full app Setting",
  AccessDenied_AttemptToUpdateSetting = "Attempted to update setting",
  AccessDenied_AttemptToDeleteSetting = "Attempted to delete setting",
  AccessDenied_AttemptToCreateSetting = "Attempted to create setting",
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

const resolveDescription = (
  description?: AuditLogDetails | AuditLogAccessDeniedDetails,
  descriptionParams?: Record<string, string>
) => {
  if (!description) return undefined;
  let descriptionFinal = description.toString();

  if (descriptionParams) {
    for (const [key, value] of Object.entries(descriptionParams)) {
      const placeholder = new RegExp(`\\$\\{${key}\\}`, "g");
      descriptionFinal = descriptionFinal.replace(placeholder, value);
    }
  }
  return descriptionFinal;
};

export const logEvent = async (
  userId: string,
  subject: { type: keyof typeof AuditSubjectType; id?: string },
  event: AuditLogEventStrings,
  description?: AuditLogDetails | AuditLogAccessDeniedDetails,
  descriptionParams?: Record<string, string>
): Promise<void> => {
  const descriptionFinal = resolveDescription(description, descriptionParams);

  const auditLog = JSON.stringify({
    userId,
    event,
    timestamp: Date.now(),
    subject,
    description: descriptionFinal,
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
