"use server";
import { dynamoDBDocumentClient } from "@lib/integration/awsServicesConnector";
import { BatchGetCommand, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import { logEvent } from "@lib/auditLogs";
import { prisma } from "@lib/integration/prismaConnector";
import { authorization } from "@lib/privileges";
import { AccessControlError } from "@lib/auth/errors";
import {
  object,
  string,
  email,
  toLowerCase,
  toTrimmed,
  minLength,
  maxLength,
  safeParse,
} from "valibot";

const _retrieveEvents = async (query: QueryCommandInput) => {
  const request = new QueryCommand(query);

  const { Items: eventsIndex, Count: eventsIndexCount } = await dynamoDBDocumentClient.send(
    request
  );
  if (eventsIndexCount === 0 || eventsIndex === undefined) {
    return [];
  }
  const eventItems = await _retrieveAuditLogs(eventsIndex);

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

const _retrieveAuditLogs = async (keys: Array<Record<string, string>>) => {
  let retries = 0;
  const maxRetries = 3;
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
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

  await dynamoDBDocumentClient.send(batchRequest).then(async (data) => {
    auditLogs.push(
      ...(data?.Responses?.AuditLogs?.map((item) => ({
        UserID: item.UserID,
        Event: item.Event,
        TimeStamp: item.TimeStamp,
        Description: item.Description,
        Subject: item.Subject,
      })) ?? [])
    );

    if (data.UnprocessedKeys?.AuditLogs) {
      while (retries < maxRetries) {
        // eslint-disable-next-line no-await-in-loop
        await delay(200); // Wait for 200ms second before retrying
        const retryRequest = new BatchGetCommand({
          RequestItems: {
            AuditLogs: {
              Keys: data.UnprocessedKeys.AuditLogs.Keys,
            },
          },
        });
        // eslint-disable-next-line no-await-in-loop
        const retryResponse = await dynamoDBDocumentClient.send(retryRequest);
        auditLogs.push(
          ...(retryResponse.Responses?.AuditLogs.map((item) => ({
            UserID: item.UserID,
            Event: item.Event,
            TimeStamp: item.TimeStamp,
            Description: item.Description,
            Subject: item.Subject,
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

export const getEventsForUser = async (userId: string) => {
  const {
    user: { id: callingUserId },
  } = await authorization.canViewAllUsers();
  const events = await _retrieveEvents({
    TableName: "AuditLogs",
    IndexName: "UserByTime",
    Limit: 100,
    KeyConditionExpression: "UserID = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
    ScanIndexForward: false,
  });
  logEvent(
    callingUserId,
    { type: "User", id: userId },
    "AuditLogsRead",
    `User ${callingUserId} read audit logs for user ${userId}`
  );
  return events;
};

export const getEventsForForm = async (formId: string) => {
  const {
    user: { id: callingUserId },
  } = await authorization.canViewAllForms();

  const events = await _retrieveEvents({
    TableName: "AuditLogs",
    IndexName: "SubjectByTimestamp",
    Limit: 100,
    KeyConditionExpression: "Subject = :formId",
    ExpressionAttributeValues: {
      ":formId": `Form#${formId}`,
    },
    ScanIndexForward: false,
  });
  logEvent(
    callingUserId,
    { type: "Form", id: formId },
    "AuditLogsRead",
    `User ${callingUserId} read audit logs for form ${formId}`
  );
  return events;
};

const emailSchema = object({
  subject: string([email()]),
});

const formSchema = object({
  subject: string([minLength(1), maxLength(100), toLowerCase(), toTrimmed()]),
});

export const findSubject = async (_: unknown, formData: FormData) => {
  authorization.hasAdministrationPrivileges().catch((e) => {
    if (e instanceof AccessControlError) {
      logEvent(
        e.user.id,
        { type: "User" },
        "AccessDenied",
        `Attempted to get events for Subject ${formData.get("subject")}`
      );
    }
    throw e;
  });

  const subject = safeParse(formSchema, Object.fromEntries(formData.entries()), {
    abortPipeEarly: true,
  });

  if (!subject.success) {
    return {
      message: "Invalid Input",
      userId: "",
      formId: "",
      subject: "",
    };
  }

  // Is the input an email or a formId?
  const isEmail = safeParse(emailSchema, subject.output, { abortPipeEarly: true });

  if (isEmail.success) {
    const userId = await prisma.user.findFirst({
      where: {
        email: isEmail.output.subject,
      },
      select: { id: true },
    });
    if (!userId) {
      return {
        message: "User not found",
        userId: "",
        formId: "",
        subject: isEmail.output.subject,
      };
    }
    return {
      message: "",
      subject: isEmail.output.subject,
      userId: userId.id,
      formId: "",
    };
  } else {
    // Verify if formId is valid
    const isValid = await prisma.template.exists({
      id: subject.output.subject,
    });
    if (!isValid) {
      return {
        message: "Form Id not found",
        subject: subject.output.subject,
        userId: "",
        formId: "",
      };
    }
    return {
      message: "",
      subject: subject.output.subject,
      userId: "",
      formId: subject.output.subject,
    };
  }
};
