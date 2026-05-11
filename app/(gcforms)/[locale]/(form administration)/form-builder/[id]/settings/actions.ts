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
  FilterableEventTypes,
} from "@lib/auditLogs";

import { logMessage } from "@lib/logger";

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

export const getFormEvents = AuthenticatedAction(
  async (session, formId: string, filter: string[] | undefined) => {
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

      let events = await retrieveEvents(
        {
          TableName: "AuditLogs",
          IndexName: "SubjectByTimestamp",
          Limit: 10000,
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

      if (filter && filter.length > 0) {
        // get the major categories for the filters
        const filterCategories = Object.keys(FilterableEventTypes).filter((key) =>
          filter.includes(key)
        );
        // flatten the major categories into their individual event types as an array of strings
        const appliedFilters = filterCategories.reduce((acc: string[], category) => {
          const eventTypes = FilterableEventTypes[category as keyof typeof FilterableEventTypes];
          return acc.concat(eventTypes);
        }, []);
        // filter the events based on the individual event types
        events = events.filter((event) => appliedFilters.includes(event.event));
      }

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
      logMessage.error(
        `Critical Error fetching form events for formId ${formId}: ${error instanceof Error ? error.message : "Unknown error"}`
      );

      return { error: "There was an error. Please try again later." } as ServerActionError;
    }
  }
);
