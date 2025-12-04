"use server";

import { createKey, deleteKey, refreshKey } from "@lib/serviceAccount";
import { revalidatePath } from "next/cache";
import { AuthenticatedAction } from "@lib/actions";
import { authorization } from "@lib/privileges";
import { AccessControlError } from "@lib/auth/errors";

import { submissionTypeExists } from "@lib/vault";
import { VaultStatus } from "@lib/types";
import { ServerActionError } from "@root/lib/types/form-builder-types";

import {
  retrieveEvents,
  logEvent,
  AuditLogDetails,
  AuditLogAccessDeniedDetails,
} from "@lib/auditLogs";

// Public facing functions - they can be used by anyone who finds the associated server action identifer

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

export const getEventsForForm = AuthenticatedAction(async (session, formId: string) => {
  try {
    await authorization.canViewForm(formId).catch((e) => {
      if (e instanceof AccessControlError) {
        logEvent(
          e.user.id,
          { type: "User" },
          "AccessDenied",
          AuditLogAccessDeniedDetails.AccessDenied_AttemptedToGetUserEmails
        );
      }
      throw e;
    });

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
        filter: ["ReadForm", "AuditLogsRead", "ListResponses"],
        mapUserEmail: true,
      }
    );

    const userId = session.user.id;

    logEvent(
      userId,
      { type: "Form", id: formId },
      "AuditLogsRead",
      AuditLogDetails.FormAuditLogsRead,
      { callingUserId: userId, formId: formId }
    );

    return events.map((event) => {
      return {
        formId: event.subject.split("#")[1],
        userId: event.userId,
        event: event.event,
        timestamp: new Date(event.timestamp).toISOString(),
        description: event.description,
      };
    });
  } catch (error) {
    return { error: "There was an error. Please try again later." } as ServerActionError;
  }
});
