"use server";

import { createKey, deleteKey, refreshKey } from "@lib/serviceAccount";
import { revalidatePath } from "next/cache";
import { promises as fs } from "fs";
import path from "path";
import { AuthenticatedAction } from "@lib/actions";

import { submissionTypeExists } from "@lib/vault";
import { VaultStatus } from "@lib/types";
import { ServerActionError } from "@root/lib/types/form-builder-types";

import { retrieveEvents } from "@lib/auditLogs";

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

export const getEventsForForm = AuthenticatedAction(async (_, formId: string) => {
  try {
    const events = await retrieveEvents(
      {
        TableName: "AuditLogs",
        IndexName: "SubjectByTimestamp",
        Limit: 100,
        KeyConditionExpression: "Subject = :formId",
        ExpressionAttributeValues: {
          ":formId": `Form#${formId}`,
        },
        ScanIndexForward: false,
      },
      {
        filter: ["ReadForm"],
        mapUserEmail: true,
      }
    );

    return events.map((event) => {
      return {
        formId: event.subject.split("#")[1],
        userId: event.userId,
        event: event.event,
        timestamp: new Date(event.timestamp).toISOString().split("T")[0],
        description: event.description,
      };
    });
  } catch (error) {
    return [
      {
        formId: formId,
        userId: "Error retrieving events",
        event: "",
        timestamp: new Date().toISOString().split("T")[0],
        description: error instanceof Error ? error.message : "Unknown error",
      },
    ];
  }
});
