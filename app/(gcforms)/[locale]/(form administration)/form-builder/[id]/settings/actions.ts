"use server";

import { createKey, deleteKey, refreshKey } from "@lib/serviceAccount";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { AuthenticatedAction } from "@lib/actions";

import { submissionTypeExists } from "@lib/vault";
import { VaultStatus } from "@lib/types";
import { ServerActionError } from "@root/lib/types/form-builder-types";

import {
  BatchGetCommand,
  QueryCommand,
  QueryCommandInput,
  QueryCommandOutput,
  BatchGetCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import { dynamoDBDocumentClient } from "@lib/integration/awsServicesConnector";
import { getUsers } from "@lib/users";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const getReadmeContent = AuthenticatedAction(async () => {
  try {
    const readmePath = path.join(process.cwd(), "./public/static/api/Readme.md");
    const content = await fs.readFile(readmePath, "utf-8");
    return { content };
  } catch (e) {
    return { error: true };
  }
});

export const createServiceAccountKey = AuthenticatedAction(async (_, templateId: string) => {
  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api-integration",
    "page"
  );
  return createKey(templateId);
});

export const refreshServiceAccountKey = AuthenticatedAction(async (_, templateId: string) => {
  revalidatePath(
    "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api-integration",
    "page"
  );
  return refreshKey(templateId);
});

export const deleteServiceAccountKey = AuthenticatedAction(async (_, templateId: string) => {
  try {
    await deleteKey(templateId);
    revalidatePath(
      "/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/settings/api-integration",
      "page"
    );
    return { templateId: templateId };
  } catch (e) {
    return { error: true, templateId: templateId };
  }
});

export const unConfirmedResponsesExist = AuthenticatedAction(async (_, formId: string) => {
  try {
    return submissionTypeExists(formId, VaultStatus.DOWNLOADED);
  } catch (error) {
    // Throw sanitized error back to client
    return { error: "There was an error. Please try again later." } as ServerActionError;
  }
});

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

const _retrieveUserEmails = async (userIds: string[]) => {
  // Pull from rds
  const users = await getUsers({ id: { in: userIds } });
  return users.map((user) => ({
    UserID: user.id,
    Email: user.email,
  }));
};

const _retrieveEvents = async (query: QueryCommandInput) => {
  const request = new QueryCommand(query);

  const response = (await dynamoDBDocumentClient.send(request)) as QueryCommandOutput;
  const { Items: eventsIndex, Count: eventsIndexCount } = response;

  if (eventsIndexCount === 0 || eventsIndex === undefined) {
    return [];
  }
  const eventItems = await _retrieveAuditLogs(eventsIndex);
  // filter out "ReadForm" event type.
  const filteredEvents = eventItems.filter((event) => event.Event !== "ReadForm");

  // batch get emails for user IDs
  const userIds = Array.from(new Set(filteredEvents.map((event) => event.UserID)));
  const userEmails = await _retrieveUserEmails(userIds);
  const userEmailMap: Record<string, string> = {};
  userEmails.forEach((user) => {
    userEmailMap[user.UserID] = user.Email;
  });

  // map user emails to events
  filteredEvents.forEach((event) => {
    event.UserID = userEmailMap[event.UserID] || "Unknown User";
  });

  return filteredEvents
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

export const getEventsForForm = AuthenticatedAction(async (_, formId: string) => {
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

  return events;
});
